import { effect } from '../effect';
import { reactive } from '../reactive';
describe('effect', () => {
  // 1. weffect收集
  it('happy path', () => {
    const user = reactive({
      age: 10
    })
    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11)

    user.age++
    expect(nextAge).toBe(12)
  });
  // 2.effect 的反回函数
  it("effect反回副作用函数runner", () => {
    // effect(fn) -> function (runner) -> fn -> return fn()
    let foo = 10
    const runner = effect(() => {
      foo++
      return "foo"
    })
    expect(foo).toBe(11)
    const r = runner()
    // 如果再次调用那么就会执行一次fn函数
    expect(foo).toBe(12)
    expect(r).toBe("foo")
  })
})