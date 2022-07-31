import { hasChanged, isObject } from './../shared';
import { isTracking, trackEffects, triggerEffects } from './effect';
import { reactive } from './reactive';
// key => dep => Set[effect,effect]
class RefImpl {
  private _value: any
  private _raw: any
  private dep
  constructor(value: any) {
    this._raw = value
    this._value = convert(value)
    this.dep = new Set()
  }
  get value() {
    // 如果ref不为空则收集依赖
    trackRefValue(this)
    return this._value
  }
  set value(newValue) {
    // 如果不相等才改变 hasChanged 返回结果取反的
    if (hasChanged(newValue, this._raw)) {
      this._raw = newValue
      this._value = convert(newValue)
      triggerEffects(this.dep)
    }
  }
}

function convert(value: any) {
  return isObject(value) ? reactive(value) : value
}

function trackRefValue(ref: any) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

export function ref(value: any) {
  return new RefImpl(value)
}