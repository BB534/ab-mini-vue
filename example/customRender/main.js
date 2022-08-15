import { createRender } from '../../lib/ab-mini-vue-esm.js'
import { App } from './App.js'
const game = new PIXI.Application({
	width: 500,
	height: 500
})

// 将画布追加到body中
document.body.append(game.view)

const render = createRender({
	createElement: (type) => {
		// 创建矩形
		if (type === 'rect') {
			const Rect = new PIXI.Graphics()
			Rect.beginFill(0xff0000)
			Rect.drawRect(0, 0, 100, 100)
			Rect.endFill()
			return Rect
		}
	},
	patchProp: (el, key, value) => {
		el[key] = value
	},
	insert: (el, parent) => {
		// canvas 追加子元素是addChild
		parent.addChild(el)
	}
})

render.createApp(App).mount(game.stage)
