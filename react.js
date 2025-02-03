const targetMap = new WeakMap(); // 存储依赖关系 {target -> {key -> Set<effect>}}
let activeEffect = null; // 当前激活的副作用

// 判断是否为对象
const isObject = (val) => val !== null && typeof val === 'object';

// 响应式核心
export function reactive(target) {
  if (!isObject(target)) return target;

  return new Proxy(target, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      track(target, key);
      // 如果获取的值是对象，则将其转换为响应式对象
      return isObject(res) ? reactive(res) : res;
    },
    set(target, key, value, receiver) {
      const oldVal = target[key];
      const res = Reflect.set(target, key, value, receiver);
      if (res && oldVal !== value) trigger(target, key);
      return res;
    }
  });
}

// 副作用系统
export function effect(fn) {
  const effect = () => {
    activeEffect = effect;
    try { fn() } finally { activeEffect = null }
  };
  effect(); // 立即执行以收集依赖
  return effect;
}

// 依赖收集
export function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target) || targetMap.set(target, new Map()).get(target);
  let dep = depsMap.get(key) || depsMap.set(key, new Set()).get(key);
  dep.add(activeEffect);
}

// 触发更新
export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  depsMap.get(key)?.forEach(effect => effect());
}

// Ref实现
export function ref(value) {
  return {
    _value: value,
    get value() {
      track(this, 'value');
      return this._value;
    },
    set value(v) {
      if (v === this._value) return;
      this._value = v;
      trigger(this, 'value');
    }
  };
}
