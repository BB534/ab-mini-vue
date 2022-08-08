export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type, // 为了后续后续组件方便,重定义挂载到实例上
    setupState: {} // state
  }
  return component
}

export function setupComponent(instance) {
  // TODO
  // initProps()
  // initSlots()
  // 初始化有状态组件
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  // 获取组件
  const Component = instance.type
  // 挂载setup代理对象,在hrender函数中可以使用this.msg获取
  instance.proxy = new Proxy({}, {
    get(target, key) {
      const { setupState } = instance
      if (key in setupState) {
        return setupState[key]
      }
    }
  })

  const { setup } = Component
  if (setup) {
    // 调用setup函数 -> function ? object
    const setupResult = setup()
    handlerSetupResult(instance, setupResult)
  }
}

function handlerSetupResult(instance, setupResult) {
  // TODO
  // is Function

  if (typeof setupResult === 'object') {
    // 如果是对象，挂载到组件实例上
    instance.setupState = setupResult
  }
  // 保证finishrender一定有值 
  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  // 看看当前组件有没有render
  const Component = instance.type

  instance.render = Component.render
  // 如果组件render存在
  // if (Component.render) {

  // }
}