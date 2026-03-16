# skill: agent-card

Svelte 에이전트 카드 컴포넌트를 정의하거나 구현할 때 쓴다.

## Read First

- `CLAUDE.md`
- `docs/MASTER_GAME_SPEC.md`
- `docs/AGENT_SYSTEM_DESIGN.md`
- `docs/TECH_ARCHITECTURE.md`

## Component Goal

AgentCard는 "설정값 묶음"이 아니라 "내가 키우는 에이전트"처럼 보여야 한다.

카드가 최소한 보여줘야 하는 것:

- 이름
- functional role
- expression role
- 상태 `IDLE | TRAINING | IN_BATTLE | REFLECTING | LOCKED`
- 레벨과 XP 진행
- bond

## Suggested Props

```ts
type AgentCardProps = {
  agent: AgentInstance;
  selected?: boolean;
  interactive?: boolean;
  compact?: boolean;
};
```

## UI Rules

- 이름이 비어 있으면 fallback 규칙을 따른다.
- XP와 bond는 숫자만이 아니라 막대나 상태 표현으로 읽혀야 한다.
- battle 중에는 편집 affordance를 주지 않는다.
- 카드 내부에서 progression 계산을 다시 하지 않는다.
- store update는 카드 밖 액션으로 넘기고, 카드는 표시와 이벤트 발행만 맡는다.

## State Cues

- `LOCKED`: 비활성 시각 처리
- `IN_BATTLE`: 현재 출전 중 표시
- `REFLECTING`: 결과 대기 또는 회고 상태 강조
- `selected`: squad 또는 edit context에서 분명히 구분

## Done Means

- roster 화면에서 카드만 봐도 누가 어떤 역할인지 읽힌다.
- XP/Bond 변화가 배틀 후 눈에 띈다.
- 카드 컴포넌트가 store/engine 로직을 집어삼키지 않는다.
