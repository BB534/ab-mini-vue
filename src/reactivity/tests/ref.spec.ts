import { effect } from '../effect'
import { reactive } from '../reactive'
import { isRef, proxyRefs, ref, unRef } from '../ref'
describe("ref", () => {
  it("happy path", () => {
    const ab = ref(1)
    expect(ab.value).toBe(1)
    ab.value = 2
    expect(ab.value).toBe(2)
  })

  it("effect ref", () => {
    const ab = ref(1)
    let dummy
    let calls = 0
    effect(() => {
      dummy = ab.value
      calls++
    })
    expect(dummy).toBe(1)
    expect(calls).toBe(1)
    ab.value = 2
    expect(dummy).toBe(2)
    expect(calls).toBe(2)
    ab.value = 2
    expect(dummy).toBe(2)
    expect(calls).toBe(2)
  })
  it("ref has reactive", () => {
    let dummy;
    let calls = 0
    const ab = ref({
      foo: 1
    })
    effect(() => {
      dummy = ab.value.foo
      calls++
    })
    expect(dummy).toBe(1)
    ab.value.foo = 2
    expect(dummy).toBe(2)
    ab.value.foo = 2
    expect(calls).toBe(3)
  })
  it("isRef", () => {
    const a = ref(1)
    const r = reactive({ ab: 1 })
    expect(isRef(a)).toBe(true)
    expect(isRef(1)).toBe(false)
    expect(isRef(r)).toBe(false)
  })
  it("unRef", () => {
    const a = ref(1)
    expect(unRef(a)).toBe(1)
    expect(unRef(1)).toBe(1)
  })
  it("proxyRefs", () => {
    const user = {
      age: ref(10),
      name: 'ab'
    }
    const prxoyUser = proxyRefs(user)
    expect(user.age.value).toBe(10)
    expect(prxoyUser.age).toBe(10)
    expect(prxoyUser.name).toBe('ab')

    prxoyUser.age = 20
    expect(user.age.value).toBe(20)
    expect(prxoyUser.age).toBe(20)

    prxoyUser.age = ref(30)
    expect(user.age.value).toBe(30)
    expect(prxoyUser.age).toBe(30)
  })
})