import { shapeFlags } from './shapeFlags'

// 特殊节点
export const Fragment = Symbol("Fragment")
// 子节点为文本直接渲染
export const Text = Symbol("Text")
export function createVnode(type: any, props?: any, children?: any) {
  const vnode = {
    type,
    props,
    key: props && props.key,
    children,
    shapeFlag: getTypeFlags(type),
    el: null,
  }

  // 处理子节点类型
  if (typeof children === 'string') {
    vnode.shapeFlag |= shapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= shapeFlags.ARRAY_CHILDREN
  }

  // 如果是一个组件类型,并且children是一个object,那么就是slot类型
  if (vnode.shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
    if (typeof vnode.children === 'object') {
      vnode.shapeFlag |= shapeFlags.SLOT_CHILDREN
    }
  }

  return vnode
}

function getTypeFlags(type) {
  // 当类型为字符串时 0000 | 0001 = 0001 = element
  return typeof type === 'string' ? shapeFlags.ELEMENT : shapeFlags.STATEFUL_COMPONENT
}


export function createTextVnode(text) {
  return createVnode(Text, {}, text)
}