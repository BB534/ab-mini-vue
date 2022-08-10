import { createVnode } from '../vnode';

export function renderSlots(children) {
  return createVnode("div", {}, children)
}