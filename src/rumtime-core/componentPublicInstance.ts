import { hasOwn } from '../shared/index'

const PublicPropertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots,
  $props: (i) => i.props
}

// 组件代理对象，提供$el state $data等 api
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance
    // 代理state,props,让其可以在render中使用this获取
    if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (hasOwn(props, key)) {
      return props[key]
    }
    // this.$el -> vnode.el
    const publicGetter = PublicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}