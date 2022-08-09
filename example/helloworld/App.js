import { h } from '../../lib/ab-mini-vue-esm.js'
import { Foo } from './Foo.js'
window.self = null
export const App = {
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
				h(Foo, { count: 1 })
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
