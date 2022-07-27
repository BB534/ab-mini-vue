import { track, trigger } from './effect'
export function reactive(raw: any) {
  // 创建Proxy对象,get和set时触发收集依赖，触发依赖
  return new Proxy(raw, {
    get(target, key) {
      const res = Reflect.get(target, key)
      track(target, key)
      return res
    },
    set(target, key, newValue) {
      const res = Reflect.set(target, key, newValue)
      trigger(target, key)
      return res
    }
  })
}