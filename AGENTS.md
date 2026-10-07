# AGENTS.md

## Operational Commands

- 패키지 관리자: `bun` 고정 (`bun.lock` 존재). npm/yarn/pnpm 사용 금지.
- 개발 서버 (API 3002 + Vite 5173 동시): `bun run dev`
- API 서버만: `bun run server`
- 테스트 (프론트 + 서버 전체): `bun run test` (`vitest run`)
- 단일 테스트: `bun run test -- server/generator.test.ts`
- 린트: `bun run lint`
- 빌드 및 타입 검사: `bun run build` (`tsc -b && vite build`)
- 작업 완료 전 `bun run lint`, `bun run test`, `bun run build`를 모두 통과시킨다.

## Golden Rules

### Immutable

- API 키를 소스에 하드코딩하거나 커밋하지 않는다. 서버는 `process.env`에서만 읽는다 (`server/index.ts:59-62`).
- `ENV_KEYS` 값을 클라이언트 응답에 노출하지 않는다. `/api/config`는 boolean만 반환한다 (`server/index.ts:150-153`).
- 브라우저에서 AI 제공자 API를 직접 호출하지 않는다. 모든 호출은 `/api/*` 프록시를 거친다 (`vite.config.ts:9-13`, `src/hooks/useComponentGenerator.ts:23`).

### Hard Constraints

- 생성 코드는 react-live `noInline` 모드로 실행되므로 `render(<Component />)` 호출이 필수다 (`src/components/LivePreview.tsx:14`, `server/generator.ts:13-14`). 서버 응답 후처리는 `ensureRenderCall(stripCodeFences(text))` 순서를 유지한다 (`server/index.ts:188`).
- 생성 코드는 import 없이 전역 `React`만 사용하는 순수 JS여야 한다 (`server/index.ts:11,20`). `SYSTEM_PROMPT`를 수정할 때 이 제약을 지운다.
- 서버 포트 3002는 `server/index.ts:139`와 `vite.config.ts:10`에 중복 정의되어 있다. 변경 시 두 곳을 함께 수정한다.

### Double Defense

- 코드 펜스 문제는 프롬프트(`server/index.ts:16`)와 후처리(`stripCodeFences`) 양쪽에서 막는다. 한쪽만 제거하지 않는다.
- Gemini 잘림은 `finishReason === 'MAX_TOKENS'` 검사로 처리한다 (`server/index.ts:123`). Anthropic 경로에는 해당 검사가 없다(비대칭). 의도적 변경이 아니면 Anthropic 쪽에 임의로 동작을 추가하지 않는다.

### Test Boundary

- 테스트가 있는 영역: `server/generator.ts`, `server/fallback.ts`, `src/components/PromptInput.tsx`. 이 파일 수정 시 대응 테스트를 함께 갱신한다.
- 테스트가 없는 영역: `server/index.ts`(Bun.serve 부수효과), `useComponentGenerator`, `LivePreview`. 로직을 추가할 때는 `server/generator.ts`처럼 순수 함수로 분리해 테스트한다 (`server/generator.ts:1-2`).

## Project Context

- 프롬프트로 React 컴포넌트를 생성하고 실시간 미리보기를 제공하는 도구.
- Stack: React 19, TypeScript, Vite, Bun(API 서버), react-live, Vitest, Testing Library, ESLint.

## Standards & References

- 소개, 설치, 기능 설명은 `README.md`를 따른다.
- 주석과 테스트 설명은 한국어로 작성한다 (기존 코드 관례).
- 커밋 메시지: `type: 한국어 요약` (예: `feat:`, `chore:`). 변경사항 커밋은 `commit` 스킬을 사용한다.
- 서버 전용 규칙은 `server/AGENTS.md` 참조.

## Maintenance Policy

- 규칙과 코드 사이에 괴리가 발견되면 작업을 마치기 전에 이 파일의 수정안을 제안한다.
