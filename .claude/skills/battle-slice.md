# skill: battle-slice

차트의 특정 구간을 "배틀 가능한 한 판"으로 압축할 때 쓴다.

## Read First

- `CLAUDE.md`
- `docs/MASTER_GAME_SPEC.md`
- `docs/CHART_BATTLEFIELD_RULEBOOK_v1.md`

## Input Contract

- 진입 판단: `long | short | hold`
- 진입 시점 가격과 캔들 구간
- 현재 레짐 또는 구조 요약
- active battle slice로 쓸 `futureCandles`
- 스쿼드 역할과 이번 objective

## Slice Recipe

1. 배틀 구간을 먼저 고정한다.
   - 전체 차트가 아니라 "지금 싸움이 벌어지는 구간"만 active slice로 잡는다.
2. 차트를 지형으로 번역한다.
   - support, resistance, range, trap, breakout gate 중 무엇이 보이는지 정리한다.
3. 포지션 의미를 전투 문법으로 바꾼다.
   - `long`: 아래에서 위로 밀어 올리는 점유 시도
   - `short`: 위에서 아래로 누르는 붕괴 시도
   - `hold`: 즉시 교전보다 정보 확보와 안전 유지
4. 레이어를 나눈다.
   - history layer
   - active zone layer
   - tactical overlay layer
5. resolve 산출물을 정한다.
   - outcome
   - qualityScore
   - rewards
   - reflection input

## Hard Rules

- 가격 데이터는 읽기 전용이다.
- active slice는 전체 히스토리보다 더 강하게 보여야 한다.
- 플레이어 압력은 기본적으로 아래에서 위, 상대 압력은 위에서 아래로 읽힌다.
- 결과 판정은 랜덤으로 바꾸지 않는다.
- reflection과 memory writeback은 resolve 이후에만 이어진다.

## Done Means

- 플레이어가 한눈에 "여기서 long/short/hold가 일어났다"를 읽을 수 있다.
- support/resistance/trap이 단순 배경이 아니라 실제 전술 지형으로 해석된다.
- slice 끝에서 `qualityScore`와 `RewardPacket`으로 자연스럽게 넘어간다.
