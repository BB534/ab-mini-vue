// instance = 组件实例
export function initSlots(instance, children) {
  // 将children挂载到组件实例的slots上
  // 因为默认children是需要vnode形式，那么多个插槽写成数组形式时无法渲染，所以我们这里强制转为数组形式，让其使用辅助函数renderSlots调用生成vnode
  instance.slots = Array.isArray(children) ? children : [children]
}