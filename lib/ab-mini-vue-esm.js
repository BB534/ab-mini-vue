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
    patch(vnode);
}
function patch(vnode, container) {
    // patch -> vnode.type  组件类型 ？ el类型
    processComponent(vnode);
}
function processComponent(vnode, container) {
    // 组件类型，挂载component
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    // 抽象出一个实例对象
    const instance = createComponentInstance(vnode);
    // 调用seup
    setupComponent(instance);
    // 调用render
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    // 拆箱 -> patch -> component ? -> patch
    const subTree = instance.render();
    // subTree === vnode  
    // vnode -> element -> mountElement
    patch(subTree);
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
            render(vnode);
        }
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

export { createApp, h };
