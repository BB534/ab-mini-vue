class ReactiveEffect {
  private _fn: any
  constructor(fn: any) {
    this._fn = fn
  }
  run() {
    activeEffect = this
    return this._fn()
  }
}

// 需要按照 {foo:1} -> 这样的键值对创建一个
// map:[{foo:1}:[set{foo:[effect]}]]存储一个个effect
const targetMap = new Map()
export function track(target: any, key: string | symbol) {
  let depMps = targetMap.get(target)
  // 初始化,不存在就需要创建
  if (!depMps) {
    depMps = new Map()
    targetMap.set(target, depMps)
  }
  // target -> key -> effect
  let dep = depMps.get(key) as Set<any>
  if (!dep) {
    dep = new Set()
    depMps.set(key, dep)
  }
  dep.add(activeEffect)
}

export function trigger(target: any, key: string | symbol) {
  // 从容器中取出target下key对应的所有的effect触发里面的fn
  const depMaps = targetMap.get(target)
  const deps = depMaps.get(key) as Set<any>
  for (const _effect of deps) {
    _effect.run()
  }
}

let activeEffect: any

export function effect(_fn: () => any) {
  const _effect = new ReactiveEffect(_fn)
  _effect.run()
  // bind 用于指定effect的this
  return _effect.run.bind(_effect)
}