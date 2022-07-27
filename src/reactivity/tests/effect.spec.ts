import { effect, stop } from '../effect';
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
  // 调度函数 scheduler
  it("effect scheduler", () => {
    // 1.通过effect的第二个参数给定一个scheduler和fn
    // 2.当effect第一次执行时还会执行内部的fn
    // 3.当响应式对象 set update 不会执行fn而是执行的scheduler
    // 4.如果说当执行runner 时会再次调用fn
    let dummy
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(() => {
      dummy = obj.foo
    }, {
      scheduler
    })
    // 预期没有被调用
    expect(scheduler).not.toHaveBeenCalled()
    // 期望dummy为1
    expect(dummy).toBe(1)
    obj.foo++
    // 断言 当obj.foo++ 时 scheduler被调用了一次,而原有的effect的fn没有被调用
    expect(scheduler).toHaveBeenCalledTimes(1)
    // 断言scheduler调用时 dummy 的值应该还是 = 1
    expect(dummy).toBe(1)
    run()
    // 手动调用runner函数时触发effect中的fn,dummy预期值应为2
    expect(dummy).toBe(2)
  })

  it("stop", () => {
    // 1.effect 调用返回runner
    // 2.然后obj触发set操作,更改值。
    // 3.调用stop之后,将effect清空，不让其fn执行.
    // 4.手动执行runner后值effect的fn正常触发
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    obj.prop = 3
    expect(dummy).toBe(2)
    runner()
    expect(dummy).toBe(3)
  })
})