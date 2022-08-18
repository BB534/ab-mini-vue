'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// 特殊节点
const Fragment = Symbol("Fragment");
// 子节点为文本直接渲染
const Text = Symbol("Text");
function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        key: props && props.key,
        children,
        shapeFlag: getTypeFlags(type),
        el: null,
    };
    // 处理子节点类型
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* shapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* shapeFlags.ARRAY_CHILDREN */;
    }
    // 如果是一个组件类型,并且children是一个object,那么就是slot类型
    if (vnode.shapeFlag & 2 /* shapeFlags.STATEFUL_COMPONENT */) {
        if (typeof vnode.children === 'object') {
            vnode.shapeFlag |= 16 /* shapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function getTypeFlags(type) {
    // 当类型为字符串时 0000 | 0001 = 0001 = element
    return typeof type === 'string' ? 1 /* shapeFlags.ELEMENT */ : 2 /* shapeFlags.STATEFUL_COMPONENT */;
}
function createTextVnode(text) {
    return createVnode(Text, {}, text);
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

function renderSlots(slots, slotName, props) {
    // 取到具名插槽
    const slot = slots[slotName];
    if (slot) {
        if (typeof slot === 'function') {
            // 如果是Fragment 那么就只渲染children
            return createVnode(Fragment, props, slot(props));
        }
    }
}

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const EMPTY_OBJ = {};
const hasChanged = (newvalue, value) => {
    return !Object.is(newvalue, value);
};
const hasOwn = (target, key) => Object.getOwnPropertyDescriptor(target, key);

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = [];
        this.active = true; // 用于stop判断状态
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        // 如果是stop状态,那么直接执行返回，不去做触发依赖
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const res = this._fn();
        // shouldTrack 关闭
        shouldTrack = false;
        return res;
    }
    stop() {
        // 给一个active状态,优化多次调用，实际上只是清空一次
        if (this.active) {
            clearEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
// 清除 deps内的effact
function clearEffect(effect) {
    // 如果是stop就把属于自身的存储容器清空
    effect.deps.forEach((dep) => {
        dep.delete(effect);
        effect.deps.length = 0;
    });
}
// 需要按照 {foo:1} -> 这样的键值对创建一个 map:[{foo:1}:[set{foo:[effect,effect1,effect2]}]]存储一个个effect
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    let depMps = targetMap.get(target);
    // 初始化,不存在就需要创建
    if (!depMps) {
        depMps = new Map();
        targetMap.set(target, depMps);
    }
    // target -> key -> effect
    let dep = depMps.get(key);
    if (!dep) {
        dep = new Set();
        depMps.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    // 如果已经存在了这个fn那么就不需要重复收集了
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    // 反向收集dep,用于清空
    activeEffect.deps.push(dep);
}
function isTracking() {
    // 如果是单纯对象的触发get操作时,并不会执行走到effect中，所以此时的activeEffect是undefined那么就不要收集
    // if (!activeEffect) return
    // 需不需要收集依赖
    // if (!shouldTrack) return
    return shouldTrack && activeEffect !== undefined;
}
function trigger(target, key) {
    // 从容器中取出target下key对应的所有的effect触发里面的fn
    const depMaps = targetMap.get(target);
    const deps = depMaps.get(key);
    triggerEffects(deps);
}
function triggerEffects(deps) {
    for (const _effect of deps) {
        if (_effect.scheduler) {
            _effect.scheduler();
        }
        else {
            _effect.run();
        }
    }
}
function effect(_fn, options = {}) {
    const _effect = new ReactiveEffect(_fn);
    // 将options的参数挂载到_effect实例上
    extend(_effect, options);
    _effect.run();
    // bind 用于指定effect的this
    const runner = _effect.run.bind(_effect);
    // 将effect挂载到runner上，方便stop查找
    runner.effect = _effect;
    return runner;
}

const get = createGetter();
const readonlyGet = createGetter(true);
const set = createSetter();
const shallReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        // 判断是不是readonly和reactive
        if (key === "__ab__isReadonly" /* ReactiveFlags.isReadonly */) {
            return isReadonly;
        }
        else if (key === "__ab__isReactive" /* ReactiveFlags.isReactive */) {
            return !isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 处理嵌套reactive
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        // 如果不是Readonly            
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutablesHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`${key} set fails because ${target} is readonly`);
        return true;
    }
};
// 改写
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallReadonlyGet
});

function reactive(raw) {
    return createReactiveObject(raw, mutablesHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}
function createReactiveObject(target, baseHandlers) {
    // 如果props不是一个对象,报警告直接返回
    if (!isObject(target)) {
        console.warn(`target ${target} 必须是一个对象`);
        return target;
    }
    return new Proxy(target, baseHandlers);
}

// key => dep => Set[effect,effect]
class RefImpl {
    constructor(value) {
        this.__isRef__ = true;
        this._raw = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        // 如果ref不为空则收集依赖
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 如果不相等才改变 hasChanged 返回结果取反的
        if (hasChanged(newValue, this._raw)) {
            this._raw = newValue;
            this._value = convert(newValue);
            triggerEffects(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    // 创建ref类的时候用一个私有标识
    return !!ref.__isRef__;
}
function unRef(ref) {
    // 如果本身是一个ref就返回ref.value的值,否则返回值本身
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(raw) {
    return new Proxy(raw, {
        get(target, key) {
            // is ref ? ref.value : raw === unRef(raw)
            return unRef(Reflect.get(target, key));
        },
        set(target, key, newValue) {
            // 如果修改的原属性是一个ref,并且新值是一个普通值，那么就直接修改value
            // 否则的话就是直接替换
            if (isRef(target[key]) && !isRef(newValue)) {
                return target[key].value = newValue;
            }
            else {
                return Reflect.set(target, key, newValue);
            }
        }
    });
}

function emit(instance, event, ...args) {
    // 找到对应组件实例上的props,查看有无这个事件
    const { props } = instance;
    const camelize = (str) => {
        return str.replace(/-(\w)/g, (_, c) => {
            return c ? c.toUpperCase() : "";
        });
    };
    const capitalize = (str) => {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
    };
    const toHandlerKey = (str) => {
        return str ? "on" + capitalize(str) : "";
    };
    const emitHandler = props[toHandlerKey(camelize(event))];
    // 调用emit时可能有多个额外参数
    emitHandler && emitHandler(...args);
}

function initProps(instance, rawProps) {
    // 将props挂载到实例上,初始化app组件时无props则默认赋值为 {} 防止代理对象失败
    instance.props = rawProps || {};
}

const PublicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
// 组件代理对象，提供$el state $data等 api
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        // 代理state,props,让其可以在render中使用this获取
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // this.$el -> vnode.el
        const publicGetter = PublicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

// instance = 组件实例
function initSlots(instance, children) {
    // 将children挂载到组件实例的slots上
    // 因为默认children是需要vnode形式，那么多个插槽写成数组形式时无法渲染，所以我们这里强制转为数组形式，让其使用辅助函数renderSlots调用生成vnode
    // 判断类型是否是slot,如果是再进行处理
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* shapeFlags.SLOT_CHILDREN */) {
        namedSlots(children, instance.slots);
    }
}
function namedSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        // 作用域插槽是一个函数,创建数组时需要调用
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: null,
        provides: (parent === null || parent === void 0 ? void 0 : parent.provides) ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
        slots: {},
        emit: () => { } // emit事件
    };
    // 初始化时,绑定emit传递当前组件实例作为instance参数
    component.emit = emit.bind(null, component);
    return component;
}
// instance = component
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props); // 挂载props
    initSlots(instance, instance.vnode.children);
    // 初始化有状态组件
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // 获取组件
    const Component = instance.type;
    // 挂载setup代理对象,在hrender函数中可以使用this.msg获取
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        // getCurrentInstance() 只能在setup中使用
        setCurrentInstance(instance);
        // 调用setup函数 -> function ? object
        // 调用setup时将props组件实例上的props传递进去
        // 使用shallowReadonly包裹setup返回值,让其是浅层不可修改的
        // 将组件实例的emit传递到setup中
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        // 当切换下一个组件前要置空
        setCurrentInstance(null);
        handlerSetupResult(instance, setupResult);
    }
}
function handlerSetupResult(instance, setupResult) {
    // TODO
    // is Function
    if (typeof setupResult === 'object') {
        // 如果是对象，挂载到组件实例上
        instance.setupState = proxyRefs(setupResult);
    }
    // 保证finishrender一定有值 
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    // 看看当前组件有没有render
    const Component = instance.type;
    instance.render = Component.render;
    // 如果组件render存在
    // if (Component.render) {
    // }
}
// 当前组件实例
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
// 抽成函数赋值，方便调试
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    // 因为provide只能在setup中使用,可以直接使用写好的获取当前组件实例方法getCurrentInstance
    const instance = getCurrentInstance();
    if (instance) {
        let { provides } = instance;
        // 初始化时改变当前的原型链指向父级,但是可能在使用provide时会多次调用，所以我们需要用一个条件限制只初始化一次。
        const parentProvides = instance.parent.provides;
        // 一进来初始化当前的provides 如果没有自己的值,那么就是和父级的provides是相等的,这时我们就改变原型链
        // 当执行给provides[key]赋值后,当前实例的provides就多了一个属性,所以就不会走到条件内去
        // 先改变原型链然后再赋值给他
        if (provides === parentProvides) {
            provides = (instance.provides = Object.create(parentProvides));
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    // 从当前子节点获取父节点上的provides
    const instance = getCurrentInstance();
    if (instance) {
        // 需求:如果当前的inject没有获取到,用户可以自定义一个默认返回值
        // 需求2:defaultValue可以是一个函数
        const provides = instance.parent.provides;
        if (key in provides) {
            return provides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

// 创建一个createApp函数,让其调用时传入依赖函数render
function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 先转换为vnode
                // rootComponent -> vnode
                // 后续的所有逻辑操作都会基于虚拟节点处理
                const vnode = createVnode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

// 创建一个对外暴露的固定接口,方便用于内部渲染器的自定义 dom 或 canvas
function createRender(options) {
    const { createElement: HostCreateElement, patchProp: HostPatchProp, insert: HostInsert, remove: HostRemove, setElementText: HostSetElementText } = options;
    function render(vnode, container) {
        // patch
        patch(null, vnode, container, null, null);
    }
    // n1:旧
    // n2:新
    function patch(n1, n2, container, parentComponent, anchor) {
        // patch -> vnode.type - > 0001 & 0001 = element ?   0010 & 0010  = component
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                // 如果是Fragment特殊节点,那么只渲染其子节点内容
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                // element
                if (shapeFlag & 1 /* shapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* shapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    function processText(n1, n2, container) {
        // 子节点为Text特殊节点，直接创建文本节点追加
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        // 利用之前已经写好的mountChildren
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        // 处理el
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        // 为了在patchProps判断是否是空对象，在外部定义一个空的{}常量，对比都引用这个就可以防止新建对象不一致的问题
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        // 从旧的节点中取el,此时更新n2并没有挂载el,所以需要赋值作为下一次备用
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapeFlag = n1.shapeFlag;
        const c1 = n1.children;
        const newShapeFlag = n2.shapeFlag;
        const c2 = n2.children;
        // 如果新节点是一个文本节点
        if (newShapeFlag & 4 /* shapeFlags.TEXT_CHILDREN */) {
            // 旧节点是一个数组
            if (prevShapeFlag & 8 /* shapeFlags.ARRAY_CHILDREN */) {
                // 1.把老的children清空
                unmountChildren(c1);
                // 2.然后设置text
                HostSetElementText(container, c2);
            }
            // 旧节点为文本，新节点为文本，切内容不同
            if (c1 !== c2) {
                HostSetElementText(container, c2);
            }
        }
        else {
            // 1.旧节点为text,新节点为array
            if (prevShapeFlag & 4 /* shapeFlags.TEXT_CHILDREN */) {
                // 1.把文本置空，然后挂载子节点
                HostSetElementText(container, "");
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                // 数组 -> 数组
                patchKeydChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function patchKeydChildren(c1, c2, container, parentComponent, parentAnchor) {
        let i = 0, e1 = c1.length - 1, e2 = c2.length - 1;
        // 从左侧开始定位
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSomeVnodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        console.log(i);
        // 查找右侧,右侧左移
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSomeVnodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 新的比旧的长，创建新节点
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1; // 定位新增的位置
                // 判断是往后还是往前插入
                const anchor = nextPos < c2.length ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            // 旧的比新的长
            while (i <= e1) {
                // 删除获取到的节点
                HostRemove(c1[i].el);
                i++;
            }
        }
        else ;
    }
    function isSomeVnodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            // 取到当前节点的el
            const el = children[i].el;
            HostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            // 遍历新的props,然后和老的属性对比，不一样就修改，没有就删除,
            for (const key in newProps) {
                const prevProps = oldProps[key];
                const nextProps = newProps[key];
                if (nextProps !== prevProps) {
                    HostPatchProp(el, key, prevProps, nextProps);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                // 如果旧的值在新的里面没有了，那么就删除
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        HostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        const { type, props, children, shapeFlag } = vnode;
        // 将 el 挂载到element类型的vnode.el上,使用外部传入的createElement自定义接口
        const el = (vnode.el = HostCreateElement(type));
        // 如果是字符串类型的子节点,直接挂载,如果是数组类型继续遍历然后patch
        // 0100 & 0100  = 0100 = 文本节点
        // children
        if (shapeFlag & 4 /* shapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* shapeFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode.children, el, parentComponent, anchor);
        }
        // 绑定属性,绑定事件，patchProp
        for (const key in props) {
            const val = props[key];
            // 事件已on开头 类似 onClick
            // const isOn = /^on[A-z]/.test(key)
            // if (isOn) {
            //   const event = key.slice(2).toLowerCase()
            //   el.addEventListener(event, val)
            // }
            // el.setAttribute(key, val)
            HostPatchProp(el, key, null, val);
        }
        // container.append(el)
        HostInsert(el, container, anchor);
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(v => {
            patch(null, v, container, parentComponent, anchor);
        });
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        // 组件类型，挂载component
        mountComponent(n2, container, parentComponent, anchor);
    }
    function mountComponent(vnode, container, parentComponent, anchor) {
        // 抽象出一个组件实例对象
        const instance = createComponentInstance(vnode, parentComponent);
        // 调用setup(组件实例对象)
        setupComponent(instance);
        // 调用render
        setupRenderEffect(vnode, instance, container, anchor);
    }
    function setupRenderEffect(vnode, instance, container, anchor) {
        // 使用effect来收集响应式依赖,然后对虚拟节点进行diff更新
        effect(() => {
            if (!instance.isMounted) {
                console.log("init");
                // App -> patch -> component ? -> patch
                // 获取setupState代理对象挂载到render
                const { proxy } = instance;
                // 使用proxyRefs来代理state,让其中的state在模板中使用时可以不用写value
                const subTree = (instance.subTree = instance.render.call(proxy));
                // subTree === vnode  
                // vnode -> element -> mountElement
                patch(null, subTree, container, instance, anchor);
                // 在所有element -> mount 完成后挂载节点到虚拟节点el上
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log('update');
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        });
    }
    // 创建一个对对象,然后使用高阶函数将render返回
    return {
        createApp: createAppApi(render)
    };
}

// 自定义节点创建
function createElement(vnode) {
    return document.createElement(vnode);
}
//自定义属性挂载
function patchProp(el, key, prevValue, nextValue) {
    // 事件已on开头 类似 onClick
    const isOn = /^on[A-z]/.test(key);
    if (isOn) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextValue);
    }
    else {
        // 如果值为undefined 或 null,就将其移除
        if (nextValue === undefined || nextValue === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextValue);
        }
    }
}
// 自定义挂载
function insert(child, container, anchor) {
    // container.append(el)
    // 使用insertBefore
    container.insertBefore(child, anchor || null);
}
// 自定义移除
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const render = createRender({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
});
function createApp(rootComponent) {
    return render.createApp(rootComponent);
}

exports.createApp = createApp;
exports.createRender = createRender;
exports.createTextVnode = createTextVnode;
exports.effect = effect;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
