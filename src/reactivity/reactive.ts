import { mutablesHandlers, readonlyHandlers } from './baseHandlers'

export function reactive(raw: any) {
  // 创建Proxy对象,get和set时触发收集依赖，触发依赖
  return createBaseHandlers(raw, mutablesHandlers)
}


export function readonly(raw: any) {
  return createBaseHandlers(raw, readonlyHandlers)
}


function createBaseHandlers(raw: any, baseHandlers: any) {
  return new Proxy(raw, baseHandlers)
}
