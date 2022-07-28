import { readonly } from '../reactive';
describe("readonly", () => {
  it('readonly 只读', () => {
    const origin = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(origin)
    expect(wrapped).not.toBe(origin)
    expect(wrapped.foo).toBe(1)
  });

  it('readonly set warn', () => {
    console.warn = jest.fn()
    const wrapped = readonly({ foo: 1, bar: { baz: 2 } })
    wrapped.foo = 2
    expect(console.warn).toBeCalled()
    expect(wrapped.foo).toBe(1)
  })
})