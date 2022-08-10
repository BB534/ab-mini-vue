import { h } from '../../lib/ab-mini-vue-esm.js'
import { Foo } from './Foo.js'
import { Slots } from './Slots.js'
window.self = null
export const App = {
	render() {
		window.self = this
		// 单个插槽
		// const slot = h(Slots, {}, h('p', {}, 'slots插槽p标签'))
		// 数组插槽
		const slot = h(Slots, {}, [h('p', {}, 'slots插槽p标签'), h('h1', {}, '数组插槽h1标签')])
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
				slot
			]
			// 调用Foo组件
		)
	},
	setup() {
		return {
			msg: '改变代理对象'
		}
	}
}
