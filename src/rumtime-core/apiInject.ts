import { getCurrentInstance } from './component'
export function provide(key, value) {
  // 因为provide只能在setup中使用,可以直接使用写好的获取当前组件实例方法getCurrentInstance
  const instance: any = getCurrentInstance()
  if (instance) {
    instance.provides[key] = value
  }
}

export function inject(key) {
  // 从当前子节点获取父节点上的provides
  const instance: any = getCurrentInstance()
  if (instance) {
    return instance.parent.provides[key]
  }
}
