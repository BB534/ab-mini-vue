import { h } from '../../lib/ab-mini-vue-esm.js'

export const App = {
	setup(props) {
		return {
			x: 20,
			y: 20
		}
	},
	render() {
		return h('rect', { x: this.x, y: this.y })
	}
}
