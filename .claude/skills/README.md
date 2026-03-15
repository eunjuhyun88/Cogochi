# Cogochi Skills

이 폴더는 큰 설계 문서를 그대로 다시 읽지 않고, 반복 작업을 짧게 시작하기 위한 로컬 작업 레시피 모음이다.

## Skills

- `battle-slice.md`
  - 차트의 한 구간을 배틀 가능한 slice로 번역할 때 사용
- `chart-render.md`
  - Canvas 2D 렌더 함수와 레이어 계약을 잡을 때 사용
- `score-engine.md`
  - 판단 품질 점수와 보상 계산 로직을 구현하거나 수정할 때 사용
- `agent-card.md`
  - Svelte 에이전트 카드 컴포넌트 스펙이 필요할 때 사용
- `spec-update.md`
  - 어떤 문서를 먼저 고쳐야 하는지와 수정 순서를 정할 때 사용

## Read Order

1. `CLAUDE.md`
2. 필요한 skill 하나
3. 해당 skill이 가리키는 canonical doc

## Guardrails

- skill은 구현 레시피다. 최종 진실 소스는 항상 `docs/` 아래 canonical 문서다.
- stable rule이 바뀌면 skill만 고치지 말고 authority 문서도 같이 수정한다.
- raw import나 덤프 문서는 `docs/references/imported/`에만 둔다.
