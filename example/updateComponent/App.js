import { h, ref } from '../../lib/ab-mini-vue-esm.js'
import { Child } from './Child.js'
export const App = {
	setup(props) {
		const msg = ref('123')
		const count = ref(0)
		window.msg = msg
		const onChangeMsg = () => {
			console.log(1)
			msg.value = '456'
		}

		const onChangeCount = () => {
			count.value++
		}

		return { msg, count, onChangeMsg, onChangeCount }
	},
	render() {
		return h('div', {}, [
			'组件更新逻辑',
			h('button', { onClick: this.onChangeMsg }, 'onChangeMsg'),
			h(Child, { msg: this.msg }),
			h('div', {}, 'count:' + this.count),
			h('button', { onClick: this.onChangeCount }, 'onChangeCount')
		])
	}
}
