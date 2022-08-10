'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: null,
        slots: {},
        emit: () => { }
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
        // 调用setup函数 -> function ? object
        // 调用setup时将props组件实例上的props传递进去
        // 使用shallowReadonly包裹setup返回值,让其是浅层不可修改的
        // 将组件实例的emit传递到setup中
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
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

function render(vnode, container) {
    // patch
    patch(vnode, container);
}
function patch(vnode, container) {
    // patch -> vnode.type - > 0001 & 0001 = element ?   0010 & 0010  = component
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* shapeFlags.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* shapeFlags.STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    // 处理el
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const { type, props, children, shapeFlag } = vnode;
    // 将 el 挂载到element类型的vnode.el上
    const el = (vnode.el = document.createElement(type));
    // 如果是字符串类型的子节点,直接挂载,如果是数组类型继续遍历然后patch
    // 0100 & 0100  = 0100 = 文本节点
    if (shapeFlag & 4 /* shapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* shapeFlags.ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    // 绑定属性,绑定事件
    for (const key in props) {
        const val = props[key];
        // 事件已on开头 类似 onClick
        const isOn = /^on[A-z]/.test(key);
        if (isOn) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val);
        }
        el.setAttribute(key, val);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    // 组件类型，挂载component
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    // 抽象出一个组件实例对象
    const instance = createComponentInstance(vnode);
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
    patch(subTree, container);
    // 在所有element -> mount 完成后挂载节点到虚拟节点el上
    vnode.el = subTree.el;
}

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

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先转换为vnode
            // rootComponent -> vnode
            // 后续的所有逻辑操作都会基于虚拟节点处理
            const vnode = createVnode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

function renderSlots(slots, slotName, props) {
    // 取到具名插槽
    const slot = slots[slotName];
    if (slot) {
        if (typeof slot === 'function') {
            return createVnode("div", props, slot(props));
        }
    }
}

exports.createApp = createApp;
exports.h = h;
exports.renderSlots = renderSlots;
