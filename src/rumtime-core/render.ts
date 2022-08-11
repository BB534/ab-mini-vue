import { createComponentInstance, setupComponent } from './component';
import { shapeFlags } from './shapeFlags';
import { Fragment, Text } from './vnode'
export function render(vnode: any, container: any, parentComponent) {
  // patch
  patch(vnode, container, parentComponent)
}

function patch(vnode: any, container: any, parentComponent) {
  // patch -> vnode.type - > 0001 & 0001 = element ?   0010 & 0010  = component
  const { shapeFlag, type } = vnode
  switch (type) {
    case Fragment:
      // 如果是Fragment特殊节点,那么只渲染其子节点内容
      processFragment(vnode, container, parentComponent)
      break;
    case Text:
      processText(vnode, container)
      break;
    default:
      if (shapeFlag & shapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent)
      } else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent)
      }
      break;
  }
}

function processText(vnode, container) {
  // 子节点为Text特殊节点，直接创建文本节点追加
  const { children } = vnode
  const textNode = (vnode.el = document.createTextNode(children))
  container.append(textNode)

}

function processFragment(vnode, container, parentComponent) {
  // 利用之前已经写好的mountChildren
  mountChildren(vnode, container, parentComponent)
}

function processElement(vnode, container, parentComponent) {
  // 处理el
  mountElement(vnode, container, parentComponent)
}

function mountElement(vnode, container, parentComponent) {
  const { type, props, children, shapeFlag } = vnode
  // 将 el 挂载到element类型的vnode.el上
  const el = (vnode.el = document.createElement(type) as Element)
  // 如果是字符串类型的子节点,直接挂载,如果是数组类型继续遍历然后patch
  // 0100 & 0100  = 0100 = 文本节点

  if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent)
  }
  // 绑定属性,绑定事件
  for (const key in props) {
    const val = props[key]
    // 事件已on开头 类似 onClick
    const isOn = /^on[A-z]/.test(key)
    if (isOn) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    }
    el.setAttribute(key, val)
  }
  container.append(el)
}

function mountChildren(vnode, container, parentComponent) {
  vnode.children.forEach(v => {
    patch(v, container, parentComponent)
  })
}

function processComponent(vnode, container, parentComponent) {
  // 组件类型，挂载component
  mountComponent(vnode, container, parentComponent)
}

function mountComponent(vnode, container, parentComponent) {
  // 抽象出一个组件实例对象
  const instance = createComponentInstance(vnode, parentComponent)
  // 调用setup(组件实例对象)
  setupComponent(instance)
  // 调用render
  setupRenderEffect(vnode, instance, container)
}

function setupRenderEffect(vnode, instance, container) {
  // App -> patch -> component ? -> patch
  // 获取setupState代理对象挂载到render
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  // subTree === vnode  
  // vnode -> element -> mountElement
  patch(subTree, container, instance)

  // 在所有element -> mount 完成后挂载节点到虚拟节点el上
  vnode.el = subTree.el
}