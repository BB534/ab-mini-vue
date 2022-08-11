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
		provide('foo', 'ProvideTow-value')
		// 自己组件内也获取父组件的注入数据,正常情况应该是获取到的---fooval,这里因为初始化时是暴力初始化成了{}所以获取到的是自己的
		const foo = inject('foo')
		return {
			foo
		}
	},
	render() {
		return h('div', {}, [createTextVnode('ProvideTow:---' + this.foo), h(Custom, {}, '')])
	}
}

const Custom = {
	setup(props) {
		const foo = inject('foo')
		const name = inject('abi')
		return {
			foo,
			name
		}
	},
	render() {
		return h('div', {}, [h('h1', {}, 'foo:' + this.foo), h('h1', {}, 'name:' + this.name)])
	}
}
