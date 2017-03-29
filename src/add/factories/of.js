import './create'
import statics from '../../statics'

statics.of = function of(...xs) {
  return statics.create({start: self => {
    xs.forEach(i => self.next(i))
    self.complete()
  }}, 'of')
}
