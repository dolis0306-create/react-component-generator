import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';

const savedComponent = {
  id: '1',
  prompt: 'p',
  code: 'c',
  createdAt: '2026-01-02T03:04:05.000Z',
};

afterEach(() => vi.unstubAllGlobals());

describe('useComponentGenerator 영속성', () => {
  it('저장된 컴포넌트 목록을 불러오고 createdAt을 Date로 복원한다', () => {
    localStorage.setItem('rcg:components', JSON.stringify([savedComponent]));
    const { result } = renderHook(() => useComponentGenerator());
    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].createdAt).toBeInstanceOf(Date);
  });

  it('생성된 컴포넌트를 localStorage에 저장한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'const A = 1;' }) }),
    );
    const { result } = renderHook(() => useComponentGenerator());
    await act(() => result.current.generate('카드', undefined, 'google'));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('rcg:components')!);
      expect(saved).toHaveLength(1);
      expect(saved[0].prompt).toBe('카드');
    });
  });

  it('전체 삭제하면 저장된 목록도 비운다', () => {
    localStorage.setItem('rcg:components', JSON.stringify([savedComponent]));
    const { result } = renderHook(() => useComponentGenerator());
    act(() => result.current.clearAll());
    expect(JSON.parse(localStorage.getItem('rcg:components')!)).toEqual([]);
  });
});
