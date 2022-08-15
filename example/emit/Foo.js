import { h, getCurrentInstance } from '../../lib/ab-mini-vue-esm.js'

export const Foo = {
	name: 'Foo',
	setup(props, { emit }) {
		const instance = getCurrentInstance()
		console.log(instance)
		// 1.setup可以接收props
		// 2. props.count 可以在render中获取
		// 3. props是一个shallowReadonly
		console.log('fop->props:', props)
		const emitAdd = () => {
			// emit派发事件
			console.log('emit add')
			emit('add', 1, 2)
			emit('add-foo', 3, 4)
		}
		return { emitAdd }
	},
	render() {
		const btns = h(
			'button',
			{
				onClick: this.emitAdd
			},
			'emitBUtton'
		)

		const foo = h('p', {}, 'foo:' + this.count)
		return h('div', {}, [foo, btns])
	}
}
