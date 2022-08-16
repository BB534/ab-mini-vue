import { effect } from '../reactivity';
import { createComponentInstance, setupComponent } from './component';
import { createAppApi } from './createApp';
import { shapeFlags } from './shapeFlags';
import { Fragment, Text } from './vnode'

// 创建一个对外暴露的固定接口,方便用于内部渲染器的自定义 dom 或 canvas
export function createRender(options) {
  const { createElement: HostCreateElement, patchProp: HostPatchProp, insert: HostInsert } = options
  function render(vnode: any, container: any) {
    // patch
    patch(null, vnode, container, null)
  }

  function patch(n1, n2: any, container: any, parentComponent) {
    // patch -> vnode.type - > 0001 & 0001 = element ?   0010 & 0010  = component
    const { shapeFlag, type } = n2
    switch (type) {
      case Fragment:
        // 如果是Fragment特殊节点,那么只渲染其子节点内容
        processFragment(n1, n2, container, parentComponent)
        break;
      case Text:
        processText(n1, n2, container)
        break;
      default:
        if (shapeFlag & shapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        }
        break;
    }
  }

  function processText(n1, n2, container) {
    // 子节点为Text特殊节点，直接创建文本节点追加
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)

  }

  function processFragment(n1, n2, container, parentComponent) {
    // 利用之前已经写好的mountChildren
    mountChildren(n2, container, parentComponent)
  }

  function processElement(n1, n2, container, parentComponent) {
    // 处理el
    if (!n1) {

      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }

  function patchElement(n1, n2, container) {
    console.log("n1", n1);
    console.log("n2", n2);
  }

  function mountElement(vnode, container, parentComponent) {
    const { type, props, children, shapeFlag } = vnode
    // 将 el 挂载到element类型的vnode.el上,使用外部传入的createElement自定义接口
    const el = (vnode.el = HostCreateElement(type))

    // 如果是字符串类型的子节点,直接挂载,如果是数组类型继续遍历然后patch
    // 0100 & 0100  = 0100 = 文本节点
    // children
    if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent)
    }
    // 绑定属性,绑定事件，patchProp
    for (const key in props) {
      const val = props[key]
      // 事件已on开头 类似 onClick
      // const isOn = /^on[A-z]/.test(key)
      // if (isOn) {
      //   const event = key.slice(2).toLowerCase()
      //   el.addEventListener(event, val)
      // }
      // el.setAttribute(key, val)
      HostPatchProp(el, key, val)
    }
    // container.append(el)
    HostInsert(el, container)
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach(v => {
      patch(null, v, container, parentComponent)
    })
  }

  function processComponent(n1, n2, container, parentComponent) {
    // 组件类型，挂载component
    mountComponent(n2, container, parentComponent)
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
    // 使用effect来收集响应式依赖,然后对虚拟节点进行diff更新
    effect(() => {
      if (!instance.isMounted) {
        console.log("init");
        // App -> patch -> component ? -> patch
        // 获取setupState代理对象挂载到render
        const { proxy } = instance
        // 使用proxyRefs来代理state,让其中的state在模板中使用时可以不用写value
        const subTree = (instance.subTree = instance.render.call(proxy))
        // subTree === vnode  
        // vnode -> element -> mountElement
        patch(null, subTree, container, instance)

        // 在所有element -> mount 完成后挂载节点到虚拟节点el上
        vnode.el = subTree.el
        instance.isMounted = true
      } else {
        console.log('update');
        const { proxy } = instance
        const subTree = instance.render.call(proxy)

        const prevSubTree = instance.subTree
        instance.subTree = subTree
        patch(prevSubTree, subTree)
      }

    })

  }

  // 创建一个对对象,然后使用高阶函数将render返回
  return {
    createApp: createAppApi(render)
  }
}