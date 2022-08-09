import { h } from '../../lib/ab-mini-vue-esm.js'

export const Foo = {
	setup(props) {
		// 1.setup可以接收props
		// 2. props.count 可以在render中获取
		// 3. props是一个shallowReadonly
		console.log('fop->props:', props)
	},
	render() {
		return h('div', {}, 'foo:' + this.count)
	}
}
