export function initProps(instance, rawProps) {
  // 将props挂载到实例上,初始化app组件时无props则默认赋值为 {} 防止代理对象失败
  instance.props = rawProps || {}
}