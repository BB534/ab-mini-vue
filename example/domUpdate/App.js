import { h, ref } from '../../lib/ab-mini-vue-esm.js'
export const App = {
	setup(props) {
		const count = ref(1)
		return {
			count
		}
	},
	render() {
		return h('div', {}, [
			h('div', {}, 'count:  ' + this.count),
			h(
				'button',
				{
					onClick: () => {
						this.count++
					}
				},
				'addCount'
			)
		])
	}
}
