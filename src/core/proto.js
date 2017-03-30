import {traverseUpOnFirstSubscriberAdded, traverseUpOnLastSubscriberRemoved, traverseUpOnStreamCompleted, traverseUpOnStreamError} from './traversals'

const dependenciesMet = stream => stream.dependencies.every(s => s.val !== undefined)

function subscribe(stream, subscriber) {
  stream.subscribers.push(subscriber)
  if (stream.subscribers.length === 1)
    traverseUpOnFirstSubscriberAdded(stream)
  return { unsubscribe: unsubscribe.bind(null, stream, subscriber) }
}

function unsubscribe(stream, subscriber) {
  if (stream.subscribers === 0) return

  stream.subscribers = stream.subscribers.filter(s => s !== subscriber)

  if (stream.subscribers.length === 0)
    traverseUpOnLastSubscriberRemoved(stream)
}

export function defaultOnNext(stream, x) {
  stream.val = x
  stream.subscribers.forEach(s => s.next(x))
  stream.dependents.forEach(s => s.next(x))
  return stream
}

export function defaultOnError(stream, error) {
  // we want to call all subscribers' complete callback when
  // all streams that have to be deactivated already have been
  // but we also want to reset stream.subscribers because
  // traverseUpOnStreamError checks that property
  const subscribers = [...stream.subscribers]
  stream.subscribers = []
  // notify up the chain
  traverseUpOnStreamError(stream)
  // notify down the chain
  stream.dependents.forEach(d => d.error(error))
  subscribers.forEach(s => s.error(error))
}

export function defaultOnComplete(stream) {
  // we want to call all subscribers' complete callback when
  // all streams that have to be deactivated already have been
  // but we also want to reset stream.subscribers because
  // traverseUpOnStreamCompleted checks that property
  const subscribers = [...stream.subscribers]
  stream.subscribers = []
  // notify up the chain
  traverseUpOnStreamCompleted(stream)
  // notify down the chain
  stream.dependents.forEach(d => {
    if (d.dependencies.every(dep => !dep.shouldEmit))
      d.complete()
  })
  subscribers.forEach(s => s.complete())
}

export default {
  subscribe: function(next, error = err => { throw new Error(err) }, complete = () => {}) {
    return subscribe(this, {next, error, complete})
  },
  next: function(value) {
    defaultOnNext(this, value)
  },
  error: function(error) {
    defaultOnError(this, error)
  },
  complete: function() {
    defaultOnComplete(this)
  },
  streamActivated: function() {},
  streamDeactivated: function() {},
  baseNextGuard: function() {
    return this.shouldEmit === true && dependenciesMet(this)
  }
}