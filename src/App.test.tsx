import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        envKeys: { anthropic: false, google: false },
        code: 'const A = () => null;\nrender(<A />);',
      }),
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('App 영속성', () => {
  it('저장된 provider와 API 키로 시작한다', async () => {
    localStorage.setItem('rcg:provider', JSON.stringify('anthropic'));
    localStorage.setItem('rcg:apiKey', JSON.stringify('sk-ant-saved'));
    render(<App />);

    expect(screen.getByLabelText('Provider')).toHaveValue('anthropic');
    expect(screen.getByLabelText('API Key')).toHaveValue('sk-ant-saved');
    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });

  it('API 키와 provider 변경을 localStorage에 저장한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('API Key'), 'AIza-test');
    expect(JSON.parse(localStorage.getItem('rcg:apiKey')!)).toBe('AIza-test');

    await user.selectOptions(screen.getByLabelText('Provider'), 'anthropic');
    expect(JSON.parse(localStorage.getItem('rcg:provider')!)).toBe('anthropic');
    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });

  it('생성 요청한 프롬프트를 히스토리에 저장한다', async () => {
    const user = userEvent.setup();
    localStorage.setItem('rcg:apiKey', JSON.stringify('key'));
    render(<App />);

    await user.type(screen.getByPlaceholderText(/고객 목록 테이블/), '프로필 카드');
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));

    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('rcg:history')!)).toEqual(['프로필 카드']),
    );
  });
});
