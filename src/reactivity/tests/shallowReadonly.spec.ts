import { isReadonly, shallowReadonly } from '../reactive'
describe("shallowReadonly", () => {
  it("shallowReadonly", () => {
    const origin = { foo: [111], bar: { baz: 2 } }
    const wrapped = shallowReadonly(origin)
    expect(isReadonly(wrapped)).toBe(true)
    expect(isReadonly(wrapped.bar)).toBe(false)
  })
})