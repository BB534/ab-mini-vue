import { h, ref } from '../../lib/ab-mini-vue-esm.js'
export const App = {
	setup(props) {
		const count = ref(1)
		const onClick = () => {
			count.value++
		}
		return {
			count,
			onClick
		}
	},
	render() {
		return h('div', {}, [
			h('div', {}, 'count:  ' + this.count),
			h(
				'button',
				{
					onClick: this.onClick
				},
				'addCount'
			)
		])
	}
}
