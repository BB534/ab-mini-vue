import { h } from '../../lib/ab-mini-vue-esm.js'
window.self = null
export const App = {
	render() {
		window.self = this
		return h('div', { id: 'root' }, [
			h('p', { class: 'red' }, 'hi' + this.msg),
			h('p', { class: 'blue' }, 'blue')
		])
	},
	setup() {
		return {
			msg: '改变代理对象'
		}
	}
}
