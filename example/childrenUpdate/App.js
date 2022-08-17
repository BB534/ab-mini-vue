import { h } from '../../lib/ab-mini-vue-esm.js'
import { ArrayToText } from './ArrayToText.js'
import { TextToText } from './TextToText.js'
import { TextToArray } from './TextToArray.js'
import { ArrayToArray } from './ArrayToArray.js'
export const App = {
	setup(props) {},
	render() {
		return h('div', {}, [
			h('p', {}, '更新子节点的逻辑主页'),
			// 老的子节点是数组，新的节点是文本
			// h(ArrayToText),
			// 老节点为文本，新节点也为文本
			// h(TextToText)
			// 老节点为文本，新节点为数组
			// h(TextToArray),
			// 老节点为数组,新节点也为数组，双端对比算法
			h(ArrayToArray)
		])
	}
}
