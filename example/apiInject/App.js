import { h, getCurrentInstance } from '../../lib/ab-mini-vue-esm.js'
import { Provide } from './Inject.js'
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
			[h(Provide, {}, '')]
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
