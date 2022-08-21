import { h } from '../../lib/ab-mini-vue-esm.js'

export const Child = {
	setup(props) {},
	render() {
		return h('h1', {}, 'msg:' + this.$props.msg)
	}
}
