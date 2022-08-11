import { getCurrentInstance } from './component'
export function provide(key, value) {
  // 因为provide只能在setup中使用,可以直接使用写好的获取当前组件实例方法getCurrentInstance
  const instance: any = getCurrentInstance()
  if (instance) {
    let { provides } = instance
    // 初始化时改变当前的原型链指向父级,但是可能在使用provide时会多次调用，所以我们需要用一个条件限制只初始化一次。
    const parentProvides = instance.parent.provides
    // 一进来初始化当前的provides 如果没有自己的值,那么就是和父级的provides是相等的,这时我们就改变原型链
    // 当执行给provides[key]赋值后,当前实例的provides就多了一个属性,所以就不会走到条件内去
    // 先改变原型链然后再赋值给他
    if (provides === parentProvides) {
      provides = (instance.provides = Object.create(parentProvides))
    }
    provides[key] = value
  }
}

export function inject(key, defaultValue) {
  // 从当前子节点获取父节点上的provides
  const instance: any = getCurrentInstance()
  if (instance) {
    // 需求:如果当前的inject没有获取到,用户可以自定义一个默认返回值
    // 需求2:defaultValue可以是一个函数
    const provides = instance.parent.provides
    if (key in provides) {
      return provides[key]
    } else if (defaultValue) {
      if (typeof defaultValue === 'function') {
        return defaultValue()
      }
      return defaultValue
    }
  }
}
