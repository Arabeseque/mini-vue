// 存储依赖的全局容器
const bucket = new WeakMap(); // 用 WeakMap 避免内存泄漏

// 当前激活的依赖函数
let activeEffect = null;

// 依赖追踪函数
function track(target, key) {
  if (!activeEffect) return; // 如果没有依赖函数，直接返回

  // 获取目标对象的依赖图
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }

  // 获取具体属性的依赖集合
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }

  // 添加当前依赖
  deps.add(activeEffect);
}

// 触发更新函数
function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;

  const deps = depsMap.get(key);
  if (deps) {
    deps.forEach(effect => effect()); // 执行所有依赖函数
  }
}

// 定义 reactive 函数，使用 Proxy 实现响应式
function reactive(target) {
  return new Proxy(target, {
    // NOTE: receiver 处理原型链
    // const parent = { count: 0 };
    // const child = Object.create(parent); // child 继承 parent
    // const proxy = reactive(child);
    //   proxy.count = 1; // 改的是谁的 count？

    get(target, key, receiver) {
      track(target, key); // 读取时收集依赖
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      Reflect.set(target, key, value, receiver); // 先设置新值
      trigger(target, key); // 修改时触发更新
      return true;
    }
  });
}

// 模拟副作用函数（类似渲染函数）
function effect(fn) {
  activeEffect = fn; // 设置当前激活的依赖
  fn(); // 立即执行一次，收集依赖
  activeEffect = null; // 清空
}

// 测试代码
const data = reactive({ count: 0 });
effect(() => {
  console.log("count is:", data.count);
});

data.count = 1; // 输出: "count is: 1"
data.count = 2; // 输出: "count is: 2"
