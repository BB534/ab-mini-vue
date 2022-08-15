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
const hasOwn = (target, key) => Object.getOwnPropertyDescriptor(target, key);

// 需要按照 {foo:1} -> 这样的键值对创建一个 map:[{foo:1}:[set{foo:[effect,effect1,effect2]}]]存储一个个effect
const targetMap = new Map();
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
        instance.setupState = setupResult;
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
    const { createElement: HostCreateElement, patchProp: HostPatchProp, insert: HostInsert } = options;
    function render(vnode, container) {
        // patch
        patch(vnode, container, null);
    }
    function patch(vnode, container, parentComponent) {
        // patch -> vnode.type - > 0001 & 0001 = element ?   0010 & 0010  = component
        const { shapeFlag, type } = vnode;
        switch (type) {
            case Fragment:
                // 如果是Fragment特殊节点,那么只渲染其子节点内容
                processFragment(vnode, container, parentComponent);
                break;
            case Text:
                processText(vnode, container);
                break;
            default:
                if (shapeFlag & 1 /* shapeFlags.ELEMENT */) {
                    processElement(vnode, container, parentComponent);
                }
                else if (shapeFlag & 2 /* shapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(vnode, container, parentComponent);
                }
                break;
        }
    }
    function processText(vnode, container) {
        // 子节点为Text特殊节点，直接创建文本节点追加
        const { children } = vnode;
        const textNode = (vnode.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(vnode, container, parentComponent) {
        // 利用之前已经写好的mountChildren
        mountChildren(vnode, container, parentComponent);
    }
    function processElement(vnode, container, parentComponent) {
        // 处理el
        mountElement(vnode, container, parentComponent);
    }
    function mountElement(vnode, container, parentComponent) {
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
            mountChildren(vnode, el, parentComponent);
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
            HostPatchProp(el, key, val);
        }
        // container.append(el)
        HostInsert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(v => {
            patch(v, container, parentComponent);
        });
    }
    function processComponent(vnode, container, parentComponent) {
        // 组件类型，挂载component
        mountComponent(vnode, container, parentComponent);
    }
    function mountComponent(vnode, container, parentComponent) {
        // 抽象出一个组件实例对象
        const instance = createComponentInstance(vnode, parentComponent);
        // 调用setup(组件实例对象)
        setupComponent(instance);
        // 调用render
        setupRenderEffect(vnode, instance, container);
    }
    function setupRenderEffect(vnode, instance, container) {
        // App -> patch -> component ? -> patch
        // 获取setupState代理对象挂载到render
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        // subTree === vnode  
        // vnode -> element -> mountElement
        patch(subTree, container, instance);
        // 在所有element -> mount 完成后挂载节点到虚拟节点el上
        vnode.el = subTree.el;
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
function patchProp(el, key, val) {
    // 事件已on开头 类似 onClick
    const isOn = /^on[A-z]/.test(key);
    if (isOn) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, val);
    }
    el.setAttribute(key, val);
}
// 自定义挂载
function insert(el, container) {
    container.append(el);
}
const render = createRender({
    createElement,
    patchProp,
    insert
});
function createApp(rootComponent) {
    return render.createApp(rootComponent);
}

exports.createApp = createApp;
exports.createRender = createRender;
exports.createTextVnode = createTextVnode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.renderSlots = renderSlots;
