import { mutablesHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers'


export const enum ReactiveFlags {
  isReadonly = '__ab__isReadonly',
  isReactive = '__ab__isReactive'
}

export function reactive(raw: object) {
  return createReactiveObject(raw, mutablesHandlers)
}

export function readonly(raw: any) {
  return createReactiveObject(raw, readonlyHandlers)
}

export function isReadonly(value: any) {
  return !!value[ReactiveFlags.isReadonly]
}

export function isReactive(value: any) {
  return !!value[ReactiveFlags.isReactive]
}


export function isProxy(value: any) {
  return value[ReactiveFlags.isReactive] || value[ReactiveFlags.isReadonly]
}

export function shallowReadonly(raw: any) {
  return createReactiveObject(raw, shallowReadonlyHandlers)
}

function createReactiveObject(raw: any, baseHandlers: any) {
  return new Proxy(raw, baseHandlers)
}
