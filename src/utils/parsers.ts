import type { GeneratedComponent, Provider } from '../types';

// localStorage에서 읽은 unknown 값을 검증해 앱 타입으로 복원한다.
// 형식이 맞지 않으면 null을 반환해 호출부가 초기값을 쓰게 한다.

export function parseProvider(raw: unknown): Provider | null {
  return raw === 'anthropic' || raw === 'google' ? raw : null;
}

export function parseStringArray(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.filter((item): item is string => typeof item === 'string');
}

export function parseComponents(raw: unknown): GeneratedComponent[] | null {
  if (!Array.isArray(raw)) return null;

  const components: GeneratedComponent[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue;
    const { id, prompt, code, createdAt } = item as Record<string, unknown>;
    if (typeof id !== 'string' || typeof prompt !== 'string' || typeof code !== 'string') continue;
    if (typeof createdAt !== 'string') continue;

    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) continue;

    components.push({ id, prompt, code, createdAt: date });
  }
  return components;
}
