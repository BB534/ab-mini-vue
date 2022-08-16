import { h, ref } from '../../lib/ab-mini-vue-esm.js'
export const App = {
	setup(props) {
		const count = ref(1)
		const onClick = () => {
			count.value++
		}
		const Props = ref({
			foo: 'foo',
			bar: 'abr'
		})

		const onChangePropsDemo1 = () => {
			Props.value.foo = 'new-foo'
		}
		const onChangePropsDemo2 = () => {
			Props.value.foo = undefined
		}

		const onChangePropsDemo3 = () => {
			Props.value = {
				foo: '只剩foo了'
			}
		}

		return {
			count,
			onClick,
			Props,
			onChangePropsDemo1,
			onChangePropsDemo2,
			onChangePropsDemo3
		}
	},
	render() {
		return h('div', { ...this.Props }, [
			h('div', {}, 'count:  ' + this.count),
			h(
				'button',
				{
					onClick: this.onClick
				},
				'addCount'
			),
			h('button', { onClick: this.onChangePropsDemo1 }, '改变foo的值'),
			h('button', { onClick: this.onChangePropsDemo2 }, '为undefined'),
			h('button', { onClick: this.onChangePropsDemo3 }, 'props不一致')
		])
	}
}
