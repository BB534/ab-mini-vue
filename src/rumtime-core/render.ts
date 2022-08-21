import { EMPTY_OBJ, getSequence } from './../shared/index';
import { effect } from '../reactivity';
import { createComponentInstance, setupComponent } from './component';
import { createAppApi } from './createApp';
import { shapeFlags } from './shapeFlags';
import { Fragment, Text } from './vnode'
import { queueJobs } from './nextTick';

// 创建一个对外暴露的固定接口,方便用于内部渲染器的自定义 dom 或 canvas
export function createRender(options) {
  const { createElement: HostCreateElement, patchProp: HostPatchProp, insert: HostInsert, remove: HostRemove, setElementText: HostSetElementText } = options
  function render(vnode: any, container: any) {
    // patch
    patch(null, vnode, container, null, null)
  }

  // n1:旧
  // n2:新
  function patch(n1, n2: any, container: any, parentComponent, anchor) {
    // patch -> vnode.type - > 0001 & 0001 = element ?   0010 & 0010  = component
    const { shapeFlag, type } = n2
    switch (type) {
      case Fragment:
        // 如果是Fragment特殊节点,那么只渲染其子节点内容
        processFragment(n1, n2, container, parentComponent, anchor)
        break;
      case Text:
        processText(n1, n2, container)
        break;
      default:
        // element
        if (shapeFlag & shapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor)
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

  function processFragment(n1, n2, container, parentComponent, anchor) {
    // 利用之前已经写好的mountChildren
    mountChildren(n2.children, container, parentComponent, anchor)
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    // 处理el
    if (!n1) {

      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    // 为了在patchProps判断是否是空对象，在外部定义一个空的{}常量，对比都引用这个就可以防止新建对象不一致的问题
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    // 从旧的节点中取el,此时更新n2并没有挂载el,所以需要赋值作为下一次备用
    const el = (n2.el = n1.el)
    patchChildren(n1, n2, el, parentComponent, anchor)
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag
    const c1 = n1.children
    const newShapeFlag = n2.shapeFlag
    const c2 = n2.children
    // 如果新节点是一个文本节点
    if (newShapeFlag & shapeFlags.TEXT_CHILDREN) {
      // 旧节点是一个数组
      if (prevShapeFlag & shapeFlags.ARRAY_CHILDREN) {
        // 1.把老的children清空
        unmountChildren(c1)
        // 2.然后设置text
        HostSetElementText(container, c2)
      }
      // 旧节点为文本，新节点为文本，且内容不同
      if (c1 !== c2) {
        HostSetElementText(container, c2)
      }
    } else {
      // 1.旧节点为text,新节点为array
      if (prevShapeFlag & shapeFlags.TEXT_CHILDREN) {
        // 1.把文本置空，然后挂载子节点
        HostSetElementText(container, "")
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        // 数组 -> 数组
        patchKeydChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }


  function patchKeydChildren(c1, c2, container, parentComponent, parentAnchor) {
    let i = 0, e1 = c1.length - 1, e2 = c2.length - 1
    // 从左侧开始定位
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSomeVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++
    }

    // 查找右侧,右侧左移
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]

      if (isSomeVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      e1--
      e2--
    }

    // 新的比旧的长，创建新节点
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1 // 定位新增的位置
        // 判断是往后还是往前插入
        const anchor = nextPos < c2.length ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) {
      // 旧的比新的长
      while (i <= e1) {
        // 删除获取到的节点
        HostRemove(c1[i].el)
        i++
      }
    } else {
      // 中间对比
      let s1 = i
      let s2 = i
      // 将新节点长度存储 c2.length - i
      const toBeforePatched = e2 - s2 + 1
      let patched = 0
      // 初始化需要进行最长递增子序列对比的映射表
      // 固定长度的数组，性能更优
      const newIndexToOldIndexMap = new Array(toBeforePatched)
      // 是否移动条件
      let moved = false
      // 最大递增数
      let maxNewIndexSoFar = 0
      // 初始化
      for (let i = 0; i < toBeforePatched; i++) newIndexToOldIndexMap[i] = 0
      // 先将新的映射起来
      const newIndexMap = new Map()
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        newIndexMap.set(nextChild.key, i)
      }
      // 遍历旧的，然后从映射表中查找是否存在

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i]
        // 当patch长度已超过需要处理的长度，直接pass掉所有多余节点
        if (patched >= toBeforePatched) {
          HostRemove(prevChild.el)
        }
        // 如果有，那么就是在新的内部存在
        let newIndex
        if (prevChild.key != null) {
          newIndex = newIndexMap.get(prevChild.key)
        } else {
          // 遍历，判断节点是否存在
          for (let j = s2; j <= e2; j++) {
            // 判断之前与现在的节点是否相同
            if (isSomeVnodeType(prevChild, c2[j])) {
              newIndex = j
              break;
            }
          }
        }
        // 如果newIndex = undefined 那么这个节点就是不存在的
        if (newIndex === undefined) {
          HostRemove(prevChild.el)
        } else {
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }
          // 给 newIndexToOldIndexMap赋值归0,但是为0为了避免没有创建，所以+1
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          // 如果存在继续patch进行深度对比
          patch(prevChild, c2[newIndex], container, parentComponent, null)
          // 每处理完一个就将patched + 1
          patched++
        }
      }
      // 计算子序列
      const insertSequence = moved ? getSequence(newIndexToOldIndexMap) : []

      // 对比移动
      let j = insertSequence.length - 1

      for (let i = toBeforePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null
        if (newIndexToOldIndexMap[i] === 0) {
          // 新创建
          patch(null, nextChild, container, parentComponent, anchor)
        } else if (moved) {
          if (j < 0 || i !== insertSequence[j]) {
            // 不相同，移动
            HostInsert(nextChild.el, container, anchor)
          } else {
            // 不需要移动
            j--
          }
        }

      }
    }
  }

  function isSomeVnodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      // 取到当前节点的el
      const el = children[i].el
      HostRemove(el)
    }
  }
  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      // 遍历新的props,然后和老的属性对比，不一样就修改，没有就删除,
      for (const key in newProps) {
        const prevProps = oldProps[key]
        const nextProps = newProps[key]
        if (nextProps !== prevProps) {
          HostPatchProp(el, key, prevProps, nextProps)
        }
      }
      if (oldProps !== EMPTY_OBJ) {
        // 如果旧的值在新的里面没有了，那么就删除
        for (const key in oldProps) {
          if (!(key in newProps)) {
            HostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  function mountElement(vnode, container, parentComponent, anchor) {
    const { type, props, children, shapeFlag } = vnode
    // 将 el 挂载到element类型的vnode.el上,使用外部传入的createElement自定义接口
    const el = (vnode.el = HostCreateElement(type))

    // 如果是字符串类型的子节点,直接挂载,如果是数组类型继续遍历然后patch
    // 0100 & 0100  = 0100 = 文本节点
    // children
    if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor)
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
      HostPatchProp(el, key, null, val)
    }
    // container.append(el)
    HostInsert(el, container, anchor)
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach(v => {
      patch(null, v, container, parentComponent, anchor)
    })
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    // 组件类型，挂载component
    if (!n1) {

      mountComponent(n2, container, parentComponent, anchor)
    } else {
      updateComponent(n1, n2)
    }
  }

  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component)
    if (shouldUpdateComponent(n1, n2)) {
      // 更新组件,重新调用render函数,然后改变虚拟节点，改变el，改变props
      // 下次要更新的虚拟节点
      instance.next = n2
      instance.update()
    } else {
      // 不更新也需要重置
      n2.el = n1.el
      instance.vnode = n2
    }
  }

  function shouldUpdateComponent(n1, n2) {
    const { props: prevProps } = n1
    const { props: nextProps } = n2
    for (const key in nextProps) {
      if (nextProps[key] !== prevProps[key]) {
        return true
      }
    }

    return false
  }
  function mountComponent(vnode, container, parentComponent, anchor) {
    // 抽象出一个组件实例对象
    const instance = (vnode.component = createComponentInstance(vnode, parentComponent))
    // 调用setup(组件实例对象)
    setupComponent(instance)
    // 调用render
    setupRenderEffect(vnode, instance, container, anchor)
  }

  function setupRenderEffect(vnode, instance, container, anchor) {
    // 使用effect来收集响应式依赖,然后对虚拟节点进行diff更新
    // 利用effect的返回值runner函数,挂载到实例上，用于组件更新
    instance.update = effect(() => {
      if (!instance.isMounted) {
        // App -> patch -> component ? -> patch
        // 获取setupState代理对象挂载到render
        const { proxy } = instance
        // 使用proxyRefs来代理state,让其中的state在模板中使用时可以不用写value
        const subTree = (instance.subTree = instance.render.call(proxy))
        // subTree === vnode  
        // vnode -> element -> mountElement
        patch(null, subTree, container, instance, anchor)

        // 在所有element -> mount 完成后挂载节点到虚拟节点el上
        vnode.el = subTree.el
        instance.isMounted = true
      } else {
        const { next, vnode } = instance
        if (next) {
          next.el = vnode.el
          updateComponentPreRender(instance, next)
        }
        // 处理更新组件
        const { proxy } = instance
        const subTree = instance.render.call(proxy)

        const prevSubTree = instance.subTree
        instance.subTree = subTree
        patch(prevSubTree, subTree, container, instance, anchor)
      }

    }, {
      // 利用effect scheduler来实现收集更新任务，微任务调用
      scheduler() {
        queueJobs(instance.update)
      }
    })

  }

  // 创建一个对对象,然后使用高阶函数将render返回
  return {
    createApp: createAppApi(render)
  }
}

function updateComponentPreRender(instance, next) {
  // 更新虚拟节点
  instance.vnode = next
  instance.next = null
  // 需要更新实例对象上的props
  instance.props = next.props

}