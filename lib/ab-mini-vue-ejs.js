'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isObject = (val) => {
    return val !== null && typeof val === 'object';
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type // 为了后续后续组件方便,重定义挂载到实例上
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    // 初始化有状态组件
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // 获取组件
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        // 调用setup函数 -> function ? object
        const setupResult = setup();
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
    // patch -> vnode.type  组件类型 ？ el类型
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    // 处理el
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const { type, props, children } = vnode;
    const el = document.createElement(type);
    // 如果是字符串类型的子节点,直接挂载,如果是数组类型继续遍历然后patch
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    for (const key in props) {
        const val = props[key];
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
    // 抽象出一个实例对象
    const instance = createComponentInstance(vnode);
    // 调用seup
    setupComponent(instance);
    // 调用render
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    // 拆箱 -> patch -> component ? -> patch
    const subTree = instance.render();
    // subTree === vnode  
    // vnode -> element -> mountElement
    patch(subTree, container);
}

function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
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

exports.createApp = createApp;
exports.h = h;