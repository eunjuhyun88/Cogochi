# AIMON Workspace Guide

## Workspace

- Path: `/Users/ej/Downloads/maxidoge-clones/Cogochi`
- Product: standalone `AI MON: Signal Wars` app extracted from STOCKCLAW arena shell
- Status: standalone root-level app, not part of `frontend/`

## Product Truth

이 앱의 목표는 `배틀 화면을 만드는 것`이 아니라:

`내가 소유한 AI 에이전트 개체를 모으고, 지표/리트레이닝을 고르고, 스쿼드를 편성해, 상대와 붙여, 성장시키는 게임`

핵심 루프:

`개체 소유 -> 로스터 관리 -> 지표 세팅/리트레이닝 -> 스쿼드 편성 -> 상대와 배틀 -> 결과 판정 -> 개체 성장/진화`

## Design Authority

1. `docs/PROJECT_CONTEXT.md`
2. `/Users/ej/Downloads/maxidoge-clones/AIMON_ARENA_EXTRACTION_PLAN.md`
3. 이 `CLAUDE.md`

repo 내부 문맥은 `docs/PROJECT_CONTEXT.md`를 우선 보고, 더 큰 설계 결정은 extraction plan을 따른다.

## Current IA

- `/` -> Trainer Hub
- `/roster` -> Owned Agents
- `/battle` -> Live Battle
- `/team` -> Squad Builder
- `/lab` -> Growth Lab

## Current Reality

UI는 `hub/roster-first`로 옮겨놨지만, 데이터 모델은 아직 완전히 옮겨지지 않았다.

현재 한계:

- `playerStore.ts`는 아직 `unlockedDexIds`, `teamDexIds`, global XP 중심
- 진짜 `OwnedAgent`, `rosterStore`, `squadStore`는 아직 없음
- 즉 UI는 육성 게임처럼 보이기 시작했지만, 상태 구조는 아직 dex-selection prototype 단계다

다음 작업 우선순위:

1. `types.ts`에 `OwnedAgent`, `TrainingLoadout`, `Squad`, `OpponentSnapshot` 추가
2. `playerStore` 분리 -> `playerStore`, `rosterStore`, `squadStore`
3. 개체별 XP / 진화 카운트 / 리트레이닝 진행 저장
4. battle reward를 개체 성장에 연결

## Important Files

- `/Users/ej/Downloads/maxidoge-clones/Cogochi/src/routes/+page.svelte`
- `/Users/ej/Downloads/maxidoge-clones/Cogochi/src/routes/roster/+page.svelte`
- `/Users/ej/Downloads/maxidoge-clones/Cogochi/src/routes/battle/+page.svelte`
- `/Users/ej/Downloads/maxidoge-clones/Cogochi/src/components/aimon/RosterGrid.svelte`
- `/Users/ej/Downloads/maxidoge-clones/Cogochi/src/components/aimon/AgentDetailPanel.svelte`
- `/Users/ej/Downloads/maxidoge-clones/Cogochi/src/lib/aimon/stores/playerStore.ts`
- `/Users/ej/Downloads/maxidoge-clones/Cogochi/src/lib/aimon/stores/gameStore.ts`
- `/Users/ej/Downloads/maxidoge-clones/Cogochi/src/lib/aimon/data/trainingProfiles.ts`

## Working Rules

- AIMON 기능은 `frontend/`가 아니라 이 `Cogochi/` 앱 안에서 진행한다
- 기존 STOCKCLAW `frontend/src/routes/arena`와 `arena-war`는 참고만 하고 직접 수정하지 않는다
- arena에서 가져올 것은 `phase rhythm`, `battle readability`, `HUD shell`뿐이다
- 금융 규칙, ORPO, wager, TP/SL 구조는 AIMON에 들여오지 않는다

## Validation

작업 후 필수:

- `npm run check`
- `npm run build`

## Recommendation

AIMON에 계속 집중할 거면 Codex workspace는 `/Users/ej/Downloads/maxidoge-clones/Cogochi`으로 옮기는 게 맞다.

이유:

- 문맥이 `frontend` 잡음 없이 AIMON 앱에 고정된다
- 새 route/store/engine 작업 경계가 분명해진다
- 다음 세션에서 바로 이 앱 기준으로 이어가기 쉽다
