---
name: create-pr
description: 현재 브랜치의 커밋과 diff를 분석해 한국어 PR 제목과 본문을 작성하고 GitHub PR을 생성한다. "PR 만들어줘", "PR 생성", "풀리퀘 올려줘", "create pr" 같은 요청에 활성화한다.
context: fork
allowed-tools: Read Glob Grep Bash
---

# Create PR

현재 브랜치의 변경사항을 분석해 `references/` 의 언어별 템플릿(`pr-template.ko.md`, `pr-template.en.md`) 형식으로 PR을 생성한다.
fork 컨텍스트에서 실행되므로, 마지막에 PR URL과 요약만 간결히 보고한다.

## 절차

### 1. 사전 확인

```bash
git branch --show-current
git status --short
gh repo view --json defaultBranchRef -q .defaultBranchRef.name
```

- git 저장소가 아니거나 `gh` 인증이 안 되어 있으면 중단하고 사용자에게 알린다.
- 현재 브랜치가 기본 브랜치(보통 `main`)이면 PR을 만들 수 없다. 중단하고 작업 브랜치를 만들라고 알린다.
- 커밋되지 않은 변경이 있으면 알리고, 커밋된 내용만으로 PR을 만든다. 대신 커밋하지 않는다.

### 2. 변경사항 분석

```bash
git fetch origin
git log --oneline origin/<기본 브랜치>..HEAD
git diff origin/<기본 브랜치>...HEAD --stat
git diff origin/<기본 브랜치>...HEAD
```

- 기본 브랜치 대비 커밋이 없으면 "PR로 만들 변경이 없어요"라고 알리고 끝낸다.
- diff가 크면 `--stat`으로 범위를 먼저 파악하고, 핵심 파일만 Read로 읽는다.
- `.env`, 키·토큰이 diff에 포함되어 있으면 PR을 만들지 말고 사용자에게 알린다.
- 변경 목적(왜)은 커밋 메시지와 코드에서 파악한다. 추측이 필요한 내용은 본문에 쓰지 않는다.

### 3. 검증 명령 확인

- `AGENTS.md` / `CLAUDE.md` 의 Operational Commands 에서 테스트·린트·빌드 명령을 찾는다.
- 직접 실행해 결과를 본문의 테스트 항목에 반영한다. 실행하지 않은 항목을 통과했다고 쓰지 않는다.
- 실패하면 실패 사실을 본문에 그대로 적고, 사용자에게도 알린다.

### 4. 제목과 본문 작성

- 언어를 정한다. 사용자가 지정하면 그에 따르고, 없으면 `git log` 의 커밋 메시지 언어를 따른다. 판단이 안 되면 한국어를 쓴다.
  - 한국어: `references/pr-template.ko.md`
  - 영어: `references/pr-template.en.md`
- 선택한 템플릿을 Read로 읽고 그 구조를 따른다. 제목과 본문은 템플릿과 같은 언어로 쓴다.
- 제목: `<type>: <요약>` 50자 안팎, 마침표 없음. type은 `feat`, `fix`, `refactor`, `chore` 중 하나.
  - 커밋이 여러 개면 가장 큰 변경의 type을 쓴다.
- 본문의 모든 섹션을 채운다. 해당 없는 섹션은 "해당 없음"(영어는 "N/A")으로 적는다.
- 시스템 지침이 정한 PR 본문 마지막 줄(attribution)이 있으면 그대로 붙인다.

### 5. 푸시와 PR 생성

```bash
git push -u origin HEAD
gh pr create --base <기본 브랜치> --title "<제목>" --body "$(cat <<'EOF'
<본문>
EOF
)"
```

- 이미 같은 브랜치의 열린 PR이 있으면(`gh pr view`) 새로 만들지 말고 URL을 알린다.
- 본문은 반드시 heredoc으로 전달한다.
- 생성 후 PR URL, 제목, 커밋 수를 보고한다.

## 금지 사항

- 기본 브랜치로 직접 푸시하지 않는다.
- `--force`, `--no-verify` 를 쓰지 않는다.
- 파일 수정, 커밋 생성은 하지 않는다. 이 스킬은 푸시와 PR 생성만 한다.
- 근거 없는 내용(실행하지 않은 테스트, 확인하지 않은 동작)을 본문에 쓰지 않는다.
