import { isObject } from './../shared/index';
import { createComponentInstance, setupComponent } from './component';
export function render(vnode: any, container: any) {
  // patch
  patch(vnode, container)
}

function patch(vnode: any, container: any) {
  // patch -> vnode.type  组件类型 ？ el类型
  if (typeof vnode.type === 'string') {
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container)
  }
}

function processElement(vnode, container) {
  // 处理el
  mountElement(vnode, container)
}

function mountElement(vnode, container) {
  const { type, props, children } = vnode
  // 将 el 挂载到element类型的vnode.el上
  const el = (vnode.el = document.createElement(type) as Element)
  // 如果是字符串类型的子节点,直接挂载,如果是数组类型继续遍历然后patch
  if (typeof children === 'string') {
    el.textContent = children
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el)
  }
  for (const key in props) {
    const val = props[key]
    el.setAttribute(key, val)
  }
  container.append(el)
}

function mountChildren(vnode, container) {
  vnode.children.forEach(v => {
    patch(v, container)
  })
}

function processComponent(vnode, container) {
  // 组件类型，挂载component
  mountComponent(vnode, container)
}

function mountComponent(vnode, container) {
  // 抽象出一个实例对象
  const instance = createComponentInstance(vnode)
  // 调用setup
  setupComponent(instance)
  // 调用render
  setupRenderEffect(vnode, instance, container)
}

function setupRenderEffect(vnode, instance, container) {
  // App -> patch -> component ? -> patch
  // 获取setupState代理对象挂载到render
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  // subTree === vnode  
  // vnode -> element -> mountElement
  patch(subTree, container)

  // 在所有element -> mount 完成后挂载节点到虚拟节点el上
  vnode.el = subTree.el
}