import { shapeFlags } from './shapeFlags'

// instance = 组件实例
export function initSlots(instance, children) {
  // 将children挂载到组件实例的slots上
  // 因为默认children是需要vnode形式，那么多个插槽写成数组形式时无法渲染，所以我们这里强制转为数组形式，让其使用辅助函数renderSlots调用生成vnode
  // 判断类型是否是slot,如果是再进行处理
  const { vnode } = instance
  if (vnode.shapeFlag & shapeFlags.SLOT_CHILDREN) {
    namedSlots(children, instance.slots)
  }
}

function namedSlots(children, slots) {
  for (const key in children) {
    const value = children[key]
    // 作用域插槽是一个函数,创建数组时需要调用
    slots[key] = (props) => normalizeSlotValue(value(props))
  }
}

function normalizeSlotValue(value) { // 如果子节点是个数组就返回,没有就变成数组方便renderSlots辅助函数生成vnode
  return Array.isArray(value) ? value : [value]
}
