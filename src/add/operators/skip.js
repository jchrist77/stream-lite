import {proto} from '../../core'
import {skip} from '../../operators/skip'

proto.skip = function(...args) {
	return skip(...args)(this)
}
