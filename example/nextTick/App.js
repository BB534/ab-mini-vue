import { h, ref, getCurrentInstance,nextTick } from '../../lib/ab-mini-vue-esm.js'

export const App = {
	setup(props) {
		const count = ref(0)
		const instance = getCurrentInstance()


		function onChangeCount(){
			for (let i = 0; i < 100; i++) {
				count.value = i
			}
			console.log(instance) // 0
			nextTick(()=>{
				console.log(instance); // 99
			})
			
		}
		return { count, onChangeCount }
	},
	render() {
		return h('div', {}, [
			'nextTick',
			h('div', {}, 'count:' + this.count),
			h('button', { onClick: this.onChangeCount }, 'onChangeCount')
		])
	}
}
