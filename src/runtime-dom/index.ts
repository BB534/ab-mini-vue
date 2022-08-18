import { createRender } from '../rumtime-core'


// 自定义节点创建
function createElement(vnode) {
  return document.createElement(vnode)
}

//自定义属性挂载
function patchProp(el, key, prevValue, nextValue) {
  // 事件已on开头 类似 onClick

  const isOn = /^on[A-z]/.test(key)
  if (isOn) {
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, nextValue)
  } else {
    // 如果值为undefined 或 null,就将其移除
    if (nextValue === undefined || nextValue === null) {
      el.removeAttribute(key)
    } else {

      el.setAttribute(key, nextValue)
    }
  }

}

// 自定义挂载
function insert(child, container, anchor) {
  // container.append(el)
  // 使用insertBefore
  container.insertBefore(child, anchor || null)
}


// 自定义移除
function remove(child) {
  const parent = child.parentNode
  if (parent) {
    parent.removeChild(child)
  }
}

function setElementText(el, text) {
  el.textContent = text
}

const render = createRender({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText
})


export function createApp(rootComponent: any) {
  return render.createApp(rootComponent)
}

export * from '../rumtime-core'