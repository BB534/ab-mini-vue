import { track, trigger } from './effect'

const get = createGetter()
const set = createSetter()
function createGetter(isRadonly: boolean = false) {
  return function (target: any, key: string | symbol) {
    const res = Reflect.get(target, key)
    if (!isRadonly) {
      track(target, key)
    }
    return res
  }
}

function createSetter() {
  return function (target: any, key: string | symbol, value: any) {
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
  get,
  set(target: any, key: string | symbol, newValue: any) {
    console.warn(`${key as string} set fails because ${target} is readonly`)
    return true
  }
}