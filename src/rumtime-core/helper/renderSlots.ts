import { createVnode } from '../vnode';

export function renderSlots(slots, slotName, props) {
  // 取到具名插槽
  const slot = slots[slotName]
  if (slot) {
    if (typeof slot === 'function') {
      return createVnode("div", props, slot(props))
    }

  }
}