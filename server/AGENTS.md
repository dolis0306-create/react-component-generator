# server/AGENTS.md

## Module Context

Bun 런타임에서 실행되는 AI API 프록시 서버. 프론트(`src/`)와 코드를 공유하지 않고 `/api/config`, `/api/generate`만 노출한다.

## Tech Stack & Constraints

- 런타임은 Bun (`Bun.serve`, `process.env`). Node 전용 API에 의존하지 않는다.
- 외부 SDK 없이 전역 `fetch`로 Anthropic/Gemini REST를 직접 호출한다 (`index.ts:69,101`). SDK를 추가하지 않는다.
- 이 폴더 테스트는 `vitest`로 실행되며 `server/**/*.test.ts`가 대상이다 (`vite.config.ts:20`).

## Implementation Patterns

- 부수효과 없는 로직은 `generator.ts`, `fallback.ts`처럼 별도 모듈로 분리하고 `*.test.ts`를 옆에 둔다. `index.ts`는 `Bun.serve`가 import 시점에 실행되므로 테스트에서 import하지 않는다.
- 새 제공자 추가 순서: `Provider` 유니온 확장, `ENV_KEYS` 항목 추가, `callXxx` 함수 작성, `/api/generate` 분기 추가. 프론트 `src/types/index.ts`의 `Provider`도 함께 수정한다.
- 응답은 항상 `CORS_HEADERS`를 포함한다 (`index.ts:51-55`). 모든 `Response.json`에 `headers: CORS_HEADERS`를 넘긴다.

## Testing Strategy

- `bun run test -- server/` 로 서버 테스트만 실행한다.
- 테스트 이름은 한국어 문장형 (`generator.test.ts` 관례).

## Local Golden Rules

- Do: Google 모델 우선순위는 `GOOGLE_MODELS` 배열 순서로만 관리한다 (`index.ts:5`). 폴백은 `withModelFallback`을 통해서만 수행한다 (`index.ts:135`).
- Do: 상태 코드 분기는 에러 메시지의 `'503'`, `'429'` 포함 여부로 한다 (`index.ts:194,201`). 새 API 호출 에러는 `API error: ${status}` 형식을 유지해야 이 분기가 동작한다 (`index.ts:85,112`).
- Don't: `withModelFallback`은 모든 에러에서 다음 모델로 넘어간다 (`fallback.ts:13-17`). 인증 오류 등을 구분하는 로직이 필요하면 호출부가 아니라 이 함수의 계약을 먼저 테스트로 정의한다.
- Don't: 요청 body의 `apiKey`를 로그로 출력하거나 응답에 포함하지 않는다 (`index.ts:161,167`). Gemini URL에 키가 쿼리로 들어가므로(`index.ts:99`) URL이나 에러 객체를 로그에 남기지 않는다.
