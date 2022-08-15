import { h, createTextVnode, getCurrentInstance } from '../../lib/ab-mini-vue-esm.js'

window.self = null
export const App = {
	name: 'App',
	setup() {
		// 获取当前组件对象实例方法
		const instance = getCurrentInstance()
		console.log(instance)
		return {
			msg: 'state'
		}
	},
	render() {
		window.self = this
		return h(
			'div',
			{},
			[h('p', { class: 'red' }, 'hi' + this.msg), h('p', { class: 'blue' }, 'blue')]
			// 调用Foo组件
		)
	}
}
