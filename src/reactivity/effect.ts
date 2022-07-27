class ReactiveEffect {
  private _fn: any
  public deps = []
  protected active = true
  constructor(fn: any, public scheduler?: any) {
    this._fn = fn
  }
  run() {
    activeEffect = this
    return this._fn()
  }
  stop() {
    // 给一个active状态,优化多次调用，实际上只是清空一次
    if (this.active) {
      clearEffect(this)
      this.active = false
    }
  }
}

// 清除 deps内的effact
function clearEffect(effect: any) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  });
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
  // 反向收集dep
  activeEffect.deps.push(dep)
}

export function trigger(target: any, key: string | symbol) {
  // 从容器中取出target下key对应的所有的effect触发里面的fn
  const depMaps = targetMap.get(target)
  const deps = depMaps.get(key) as Set<any>
  for (const _effect of deps) {
    if (_effect.scheduler) {
      _effect.scheduler()
    } else {
      _effect.run()
    }
  }
}

let activeEffect: any

export function effect(_fn: () => any, options: any = {}) {
  const scheduler = options.scheduler
  const _effect = new ReactiveEffect(_fn, scheduler)
  _effect.run()
  // bind 用于指定effect的this
  const runner: any = _effect.run.bind(_effect)
  // 将effect挂载到runner上，方便stop查找
  runner.effect = _effect
  return runner
}

export function stop(runner: any) {
  runner.effect.stop()
}