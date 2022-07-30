import { isReadonly, readonly } from '../reactive';
describe("readonly", () => {
  it('readonly has get', () => {
    const origin = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(origin)
    expect(wrapped).not.toBe(origin)
    wrapped.foo = 2
    expect(wrapped.foo).toBe(1)
  });
  it('readonly has isReadonly', () => {
    const origin = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(origin)
    expect(wrapped).not.toBe(origin)
    expect(isReadonly(wrapped)).toBe(true)
    expect(isReadonly(origin)).toBe(false)
  })
  it('readonly set warn', () => {
    console.warn = jest.fn()
    const wrapped = readonly({ foo: 1, bar: { baz: 2 } })
    wrapped.foo = 2
    expect(console.warn).toBeCalled()
    expect(wrapped.foo).toBe(1)
  })
  it("nested readonly", () => {
    const origin = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(origin)
    expect(isReadonly(wrapped.bar)).toBe(true)
  })
})