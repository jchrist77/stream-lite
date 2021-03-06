import {baseNext, Stream} from '../internal'
import {toStream} from '../util/to-stream'

export const buffer = innerStream => stream => {
  let subscription = null
  let buffered = []

  return Stream({
    next(x) {
      buffered.push(x)
    },
    onStart() {
      subscription = toStream(innerStream).subscribe(
        _ => {
          baseNext(this, buffered)
          buffered = []
        },
        this.error.bind(this),
        this.complete.bind(this)
      )
    },
    onStop() {
      subscription && subscription.unsubscribe()
      subscription = null
      buffered = []
    },
    dependencies: [stream]
  })
}
