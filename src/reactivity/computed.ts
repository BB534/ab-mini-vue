
import { ReactiveEffect } from './effect'
class ComputedRefImpl {
  private _dirTy = true
  private _value: any
  private _effect: any
  constructor(getter: Function) {
    // 初始化时,使用effect收集起来,然后使用scheduler的特性每次set时先将_dirTy 锁关闭
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirTy) {
        this._dirTy = true
      }
    })
  }
  get value() {
    // 加锁,当vlaue没有修改时，getter不应该执行多次
    if (this._dirTy) {
      this._dirTy = false
      this._value = this._effect.run()
    }
    return this._value
  }
}



export function computed(getter: Function) {
  // 获取计算属性.value时触发get value操作,直接返回函数执行的结果
  return new ComputedRefImpl(getter)
}