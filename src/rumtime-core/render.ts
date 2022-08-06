import { createComponentInstance, setupComponent } from './component'
export function render(vnode: any, container: any) {
  // patch
  patch(vnode, container)
}

function patch(vnode: any, container: any) {
  // patch -> vnode.type  组件类型 ？ el类型
  processComponent(vnode, container)
}

function processComponent(vnode, container) {
  // 组件类型，挂载component
  mountComponent(vnode, container)
}

function mountComponent(vnode, container) {
  // 抽象出一个实例对象
  const instance = createComponentInstance(vnode)
  // 调用seup
  setupComponent(instance)
  // 调用render
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  // 拆箱 -> patch -> component ? -> patch
  const subTree = instance.render()
  // subTree === vnode  
  // vnode -> element -> mountElement
  patch(subTree, container)
}