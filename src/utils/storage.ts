/** localStorage에서 JSON 값을 읽는다. 값이 없거나 깨졌거나 parse가 null을 반환하면 fallback을 쓴다. */
export function loadFromStorage<T>(
  key: string,
  fallback: T,
  parse?: (raw: unknown) => T | null,
): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    const raw: unknown = JSON.parse(stored);
    if (!parse) return raw as T;
    return parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

/** localStorage에 JSON으로 저장한다. 용량 초과·사생활 보호 모드 등의 실패는 무시한다. */
export function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패가 앱 동작을 막지 않도록 무시한다.
  }
}
