import { isReactive, reactive } from '../reactive';
describe('reactive', () => {
  it("happy path", () => {
    const originl = { foo: 1 }
    const observed = reactive(originl)
    // Proxy({foo:1}) != {foo:1}
    expect(observed).not.toBe(originl)
    // Proxy.get(foo) = 1
    expect(observed.foo).toBe(1)
  })

  it("has isReactive", () => {
    const origin = { foo: 1 }
    const user = reactive(origin)
    expect(origin).not.toBe(user)
    expect(isReactive(user)).toBe(true)
    expect(isReactive(origin)).toBe(false)
  })
});