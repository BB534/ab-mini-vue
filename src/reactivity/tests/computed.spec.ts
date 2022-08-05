import { computed } from '../computed'
import { reactive } from '../reactive'

describe("computed", () => {
  it("happ path", () => {
    const user = reactive({
      age: 10,
      name: 'ab'
    })
    const age = computed(() => {
      return user.age
    })
    expect(age.value).toBe(10)
  })
  it("should computed lazy", () => {
    const user = reactive({
      foo: 1
    })
    const getter = jest.fn(() => {
      return user.foo
    })
    const value = computed(getter)

    // 没有触发get value操作时,getter函数不应该触发
    expect(getter).not.toHaveBeenCalled()

    // 当触发get value后,getter函数应该触发一次
    expect(value.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)

    // 再次触发 value.value getter函数应该还是一次执行，因为value没有被修改
    value.value
    expect(getter).toHaveBeenCalledTimes(1)
    // 当值发生改变后,getter应该被触发
    user.foo = 2
    expect(getter).toHaveBeenCalledTimes(1)

    expect(value.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)
  })
})