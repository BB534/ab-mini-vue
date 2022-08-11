import { h, createTextVnode, provide, inject } from '../../lib/ab-mini-vue-esm.js'
export const Provide = {
	name: 'Provide',
	setup(props) {
		provide('foo', '---fooval')
		provide('abi', '最帅了')
	},
	render() {
		return h('div', {}, [createTextVnode('Provide'), h(ProvideTow, {}, '')])
	}
}

const ProvideTow = {
	setup(props) {
		const foo = inject('foo')
		const name = inject('abi')
		return {
			foo,
			name
		}
	},
	render() {
		return h('div', {}, [
			createTextVnode('ProvideTow'),
			h('h1', {}, 'foo:' + this.foo),
			h('h1', {}, 'name:' + this.name),
			h(Custom, {}, '')
		])
	}
}

const Custom = {
	setup(props) {},
	render() {
		return h('div', {}, 'Custom')
	}
}
