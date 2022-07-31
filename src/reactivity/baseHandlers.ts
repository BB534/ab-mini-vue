import { extend, isObject } from '../shared';
import { track, trigger } from './effect';
import { reactive, ReactiveFlags, readonly } from './reactive';
const get = createGetter()
const readonlyGet = createGetter(true)
const set = createSetter()
const shallReadonlyGet = createGetter(true, true)
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: any, key: string | symbol) {
    // 判断是不是readonly和reactive
    if (key === ReactiveFlags.isReadonly) {
      return isReadonly
    } else if (key === ReactiveFlags.isReactive) {
      return !isReadonly
    }
    const res = Reflect.get(target, key)
    if (shallow) {
      return res
    }
    // 处理嵌套reactive
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
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
  set(target: any, key: any) {
    console.warn(`${key} set fails because ${target} is readonly`)
    return true
  }
}

// 改写
export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallReadonlyGet
})