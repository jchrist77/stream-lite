import {statics} from '../../core'

statics.timer = function timer(initialDelay, step) {
  const producer = {
    counter: 1,
    id: null,
    start: function(consumer) {
      setTimeout(() => {
        consumer.next(0)
        if (step)
          this.id = setInterval(() => consumer.next(this.counter++), step)
        else
          consumer.complete()
      }, initialDelay)
    },
    stop: function() {
      clearInterval(this.id)
    }
  }
  return statics.create(producer)
}