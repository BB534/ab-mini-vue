import { ref, h } from '../../lib/ab-mini-vue-esm.js'
const nextChildren = 'newChildren'
const prevChildren = 'prevChildren'
export const TextToText = {
	setup(props) {
		const isChange = ref(false)
		window.isChange = isChange

		return {
			isChange
		}
	},
	render() {
		const self = this
		return self.isChange === true ? h('div', {}, nextChildren) : h('div', {}, prevChildren)
	}
}
