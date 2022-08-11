import { h, createTextVnode, getCurrentInstance } from '../../lib/ab-mini-vue-esm.js'
import { Foo } from './Foo.js'
import { Slots } from './Slots.js'
import { Provide } from './Inject.js'
window.self = null
export const App = {
	name: 'App',
	render() {
		window.self = this

		// 单个插槽
		// const slot = h(Slots, {}, h('p', {}, 'slots插槽p标签'))
		// 数组插槽
		// const slot = h(Slots, {}, [h('p', {}, 'slots插槽p标签'), h('h1', {}, '数组插槽h1标签')])
		// 转变 改为具名插槽
		// const slot = h(
		// 	Slots,
		// 	{},
		// 	{
		// 		header: h('p', {}, 'header具名插槽'),
		// 		footer: h('p', {}, 'footer具名插槽')
		// 	}
		// )
		// 转变 改为作用域插槽
		const slot = h(
			Slots,
			{},
			{
				header: ({ title }) => h('p', {}, 'header:' + title),
				footer: () => h('p', {}, [createTextVnode('这是文本'), createTextVnode('这是文本节点2')])
			}
		)
		return h(
			'div',
			{
				id: 'root',
				onClick: () => {
					console.log(1)
				}
			},
			[
				h('p', { class: 'red' }, 'hi' + this.msg),
				h('p', { class: 'blue' }, 'blue'),
				h(Foo, {
					count: 1,
					onAddFoo(a, b) {
						console.log('短横线触发方式', a, b)
					},
					onAdd(c, d) {
						console.log('驼峰方式触发', c, d)
					}
				}),
				slot,
				h(Provide, {}, '')
			]
			// 调用Foo组件
		)
	},
	setup() {
		// 获取当前组件对象实例方法
		const instance = getCurrentInstance()
		console.log(instance)
		return {
			msg: '改变代理对象'
		}
	}
}
