import { createVnode, Fragment } from '../vnode';

export function renderSlots(slots, slotName, props) {
  // 取到具名插槽
  const slot = slots[slotName]
  if (slot) {
    if (typeof slot === 'function') {
      // 如果是Fragment 那么就只渲染children
      return createVnode(Fragment, props, slot(props))
    }

  }
}