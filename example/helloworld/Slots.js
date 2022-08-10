import { h, renderSlots } from '../../lib/ab-mini-vue-esm.js'
export const Slots = {
	setup(props) {},
	render() {
		const foo = h('p', {}, 'foo')
		console.log(this.$slots)
		return h('div', {}, [foo, renderSlots(this.$slots)])
	}
}
