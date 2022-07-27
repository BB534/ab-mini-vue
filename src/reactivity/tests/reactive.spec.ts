import { reactive } from '../reactive';
describe('reactive', () => {
  it("happy path", () => {
    const originl = { foo: 1 }
    const observed = reactive(originl)
    // Proxy({foo:1}) != {foo:1}
    expect(observed).not.toBe(originl)
    // Proxy.get(foo) = 1
    expect(observed.foo).toBe(1)
  })
});