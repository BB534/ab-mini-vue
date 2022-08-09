export function emit(instance, event, ...args) {
  // 找到对应组件实例上的props,查看有无这个事件
  const { props } = instance

  const camelize = (str: string) => {
    return str.replace(/-(\w)/g, (_, c: string) => {
      return c ? c.toUpperCase() : ""
    })
  }

  const capitalize = (str: string) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : ""
  }
  const toHandlerKey = (str: string) => {
    return str ? "on" + capitalize(str) : ""
  }
  const emitHandler = props[toHandlerKey(camelize(event))]
  // 调用emit时可能有多个额外参数
  emitHandler && emitHandler(...args)
}