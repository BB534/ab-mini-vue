import { ref, h } from '../../lib/ab-mini-vue-esm.js'
const nextChildren = [h('div', {}, 'A'), h('div', {}, 'B')]
const prevChildren = [h('div', {}, 'C'), h('div', {}, 'D')]
export const ArrayToArray = {
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
