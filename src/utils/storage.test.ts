import { describe, it, expect, vi } from 'vitest';
import { loadFromStorage, saveToStorage } from './storage';

describe('storage', () => {
  it('저장한 값을 그대로 읽어온다', () => {
    saveToStorage('k', { a: 1 });
    expect(loadFromStorage('k', null)).toEqual({ a: 1 });
  });

  it('값이 없으면 fallback을 반환한다', () => {
    expect(loadFromStorage('missing', 'fb')).toBe('fb');
  });

  it('JSON이 깨져 있으면 fallback을 반환한다', () => {
    localStorage.setItem('k', '{broken');
    expect(loadFromStorage('k', 'fb')).toBe('fb');
  });

  it('parse가 null을 반환하면 fallback을 반환한다', () => {
    saveToStorage('k', 123);
    expect(loadFromStorage('k', 'fb', () => null)).toBe('fb');
  });

  it('parse 결과를 반환한다', () => {
    saveToStorage('k', 2);
    expect(loadFromStorage('k', 0, (raw) => (raw as number) * 10)).toBe(20);
  });

  it('저장소가 예외를 던져도 save는 에러를 전파하지 않는다', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => saveToStorage('k', 1)).not.toThrow();
    spy.mockRestore();
  });
});
