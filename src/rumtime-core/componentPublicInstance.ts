const PublicPropertiesMap = {
  $el: (i) => i.vnode.el
}

// 组件代理对象，提供$el state $data等 api
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState } = instance
    if (key in setupState) {
      return setupState[key]
    }
    // this.$el -> vnode.el
    const publicGetter = PublicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}