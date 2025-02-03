import { describe, test, expect, vi } from 'vitest';
import { reactive, ref, effect } from './react.js';

describe('响应式系统测试', () => {
  test('reactive 应该正确处理对象的响应式', () => {
    const obj = reactive({ count: 0 });
    let dummy;
    
    effect(() => {
      dummy = obj.count;
    });
    
    expect(dummy).toBe(0);
    obj.count = 7;
    expect(dummy).toBe(7);
  });

  test('ref 应该正确处理基础值的响应式', () => {
    const count = ref(0);
    let dummy;
    
    effect(() => {
      dummy = count.value;
    });
    
    expect(dummy).toBe(0);
    count.value = 7;
    expect(dummy).toBe(7);
  });

  test('effect 应该正确追踪和更新依赖', () => {
    const obj = reactive({ count: 0, text: 'hello' });
    const spy = vi.fn();
    
    effect(() => {
      spy(obj.count);
    });
    
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(0);
    
    obj.count++;
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith(1);
    
    // 更新不相关的属性不应触发effect
    obj.text = 'world';
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('reactive 应该处理嵌套对象', () => {
    const obj = reactive({
      nested: {
        count: 0
      }
    });
    let dummy;
    
    effect(() => {
      dummy = obj.nested.count;
    });
    
    expect(dummy).toBe(0);
    obj.nested.count = 7;
    expect(dummy).toBe(7);
  });

  test('ref 不应在值相同时触发更新', () => {
    const count = ref(0);
    const spy = vi.fn();
    
    effect(() => {
      spy(count.value);
    });
    
    expect(spy).toHaveBeenCalledTimes(1);
    count.value = 0; // 相同的值
    expect(spy).toHaveBeenCalledTimes(1);
    count.value = 1; // 不同的值
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
