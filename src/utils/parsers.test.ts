import { describe, it, expect } from 'vitest';
import { parseProvider, parseStringArray, parseComponents } from './parsers';

describe('parseProvider', () => {
  it('유효한 provider만 통과시킨다', () => {
    expect(parseProvider('anthropic')).toBe('anthropic');
    expect(parseProvider('google')).toBe('google');
  });

  it('알 수 없는 값은 null이다', () => {
    expect(parseProvider('openai')).toBeNull();
    expect(parseProvider(1)).toBeNull();
  });
});

describe('parseStringArray', () => {
  it('문자열만 남긴다', () => {
    expect(parseStringArray(['a', 1, 'b', null])).toEqual(['a', 'b']);
  });

  it('배열이 아니면 null이다', () => {
    expect(parseStringArray('a')).toBeNull();
  });
});

describe('parseComponents', () => {
  const valid = { id: '1', prompt: 'p', code: 'c', createdAt: '2026-01-02T03:04:05.000Z' };

  it('createdAt을 Date로 복원한다', () => {
    const [component] = parseComponents([valid])!;
    expect(component.createdAt).toBeInstanceOf(Date);
    expect(component.createdAt.toISOString()).toBe(valid.createdAt);
  });

  it('형식이 잘못된 항목은 제외한다', () => {
    const result = parseComponents([valid, { id: 2 }, { ...valid, createdAt: 'nope' }, null]);
    expect(result).toHaveLength(1);
  });

  it('배열이 아니면 null이다', () => {
    expect(parseComponents({})).toBeNull();
  });
});
