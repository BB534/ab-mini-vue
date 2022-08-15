import { h, getCurrentInstance } from '../../lib/ab-mini-vue-esm.js'
import { Foo } from './Foo.js'

window.self = null
export const App = {
	name: 'App',
	render() {
		window.self = this

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
				})
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
