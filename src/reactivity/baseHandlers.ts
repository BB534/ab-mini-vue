import { track, trigger } from './effect'
import { ReactiveFlags } from './reactive'
const get = createGetter()
const readonlyGet = createGetter(true)
const set = createSetter()
function createGetter(isReadonly = false) {
  return function get(target: any, key: string | symbol) {
    const res = Reflect.get(target, key)
    // 判断是不是readonly和reactive
    if (key === ReactiveFlags.isReadonly) {
      return isReadonly
    } else if (key === ReactiveFlags.isReactive) {
      return !isReadonly
    }
    // 如果不是Readonly            
    if (!isReadonly) {
      track(target, key)
    }
    return res
  }
}

function createSetter() {
  return function set(target: any, key: string | symbol, value: any) {
    const res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}

export const mutablesHandlers = {
  get,
  set
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target: any, key: string | symbol, newValue: any) {
    console.warn(`${key as string} set fails because ${target} is readonly`)
    return true
  }
}