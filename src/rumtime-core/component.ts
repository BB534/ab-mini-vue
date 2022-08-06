export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type // 为了后续后续组件方便,重定义挂载到实例上
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

  // 如果组件render存在
  if (Component.render) {
    instance.render = Component.render
  }
}