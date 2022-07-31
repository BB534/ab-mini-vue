import { isProxy, isReactive, reactive } from '../reactive';
describe('reactive', () => {
  it("happy path", () => {
    const originl = { foo: 1 }
    const observed = reactive(originl)
    // Proxy({foo:1}) != {foo:1}
    expect(observed).not.toBe(originl)
    // Proxy.get(foo) = 1
    expect(observed.foo).toBe(1)
    expect(isProxy(observed)).toBe(true)
  })

  it("has isReactive", () => {
    const origin = { foo: 1 }
    const user = reactive(origin)
    expect(origin).not.toBe(user)
    expect(isReactive(user)).toBe(true)
    expect(isReactive(origin)).toBe(false)
  })

  it("nested reactive", () => {
    const origin = {
      nested: {
        foo: 1
      },
      array: [{ bar: 2 }]
    }
    const obj = reactive(origin)
    expect(isReactive(obj.nested)).toBe(true)
    expect(isReactive(obj.array)).toBe(true)
    expect(isReactive(obj.array[0])).toBe(true)
  })

});