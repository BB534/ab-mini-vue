import { ref, h } from '../../lib/ab-mini-vue-esm.js'
// 左侧查找定位
// (A,B)C
// (A,b)D E
// const prevChildren = [
// 	h('div', { key: 'A' }, 'A'),
// 	h('div', { key: 'B' }, 'B'),
// 	h('div', { key: 'C' }, 'C')
// ]
// const nextChildren = [
// 	h('div', { key: 'A' }, 'A'),
// 	h('div', { key: 'B' }, 'B'),
// 	h('div', { key: 'D' }, 'D'),
// 	h('div', { key: 'E' }, 'E')
// ]

// 右侧查找
//   a (b,c)
// d e (b,c)
// const nextChildren = [
// 	h('div', { key: 'D' }, 'D'),
// 	h('div', { key: 'E' }, 'E'),
// 	h('div', { key: 'B' }, 'B'),
// 	h('div', { key: 'C' }, 'C')
// ]
// const prevChildren = [
// 	h('div', { key: 'A' }, 'A'),
// 	h('div', { key: 'B' }, 'B'),
// 	h('div', { key: 'C' }, 'C')
// ]

// 新的比老的长

// 左侧
// const prevChildren = [h('div', { key: 'A' }, 'A'), h('div', { key: 'B' }, 'B')]
// const nextChildren = [
// 	h('div', { key: 'A' }, 'A'),
// 	h('div', { key: 'B' }, 'B'),
// 	h('div', { key: 'C' }, 'C')
// ]
// 右侧
//   (a,b)
// c (a,b)
// i = 0 e1 = -1 e2 = 0
// const prevChildren = [h('div', { key: 'A' }, 'A'), h('div', { key: 'B' }, 'B')]
// const nextChildren = [
// 	h('div', { key: 'C' }, 'C'),
// 	h('div', { key: 'A' }, 'A'),
// 	h('div', { key: 'B' }, 'B')
// ]

// 旧的比新的长

// // 左侧
// const nextChildren = [h('div', { key: 'A' }, 'A'), h('div', { key: 'B' }, 'B')]
// const prevChildren = [
// 	h('div', { key: 'A' }, 'A'),
// 	h('div', { key: 'B' }, 'B'),
// 	h('div', { key: 'C' }, 'C')
// ]

// 右侧
const nextChildren = [h('div', { key: 'A' }, 'A'), h('div', { key: 'B' }, 'B')]
const prevChildren = [
	h('div', { key: 'C' }, 'C'),
	h('div', { key: 'A' }, 'A'),
	h('div', { key: 'B' }, 'B')
]

export const ArrayToArray = {
	setup(props) {
		const isChange = ref(false)
		window.isChange = isChange

		return {
			isChange
		}
	},
	render() {
		const self = this
		return self.isChange === true ? h('div', {}, nextChildren) : h('div', {}, prevChildren)
	}
}
