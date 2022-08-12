
import { createVnode } from './vnode'

// 创建一个createApp函数,让其调用时传入依赖函数render
export function createAppApi(render) {
  return function createApp(rootComponent: any) {
    return {
      mount(rootContainer: any) {
        // 先转换为vnode
        // rootComponent -> vnode
        // 后续的所有逻辑操作都会基于虚拟节点处理
        const vnode = createVnode(rootComponent)
        render(vnode, rootContainer)
      }
    }
  }
}