# skill: chart-render

Canvas 2D 기반 배틀 렌더 함수를 설계하거나 구현할 때 쓴다.

## Read First

- `CLAUDE.md`
- `docs/CHART_BATTLEFIELD_RULEBOOK_v1.md`
- `docs/design-docs/cozy-chart-feel-spec.md`

## Layer Contract

- `ctxChart`
  - 차트 히스토리, 지형, active slice 바닥 레이어
- `ctxFx`
  - tactical overlay, pressure beam, danger zone, particle
- `ctxChar`
  - 아군/적군, projectiles, hit reaction, objective emphasis

DOM은 클릭 가능한 UI에만 쓰고, 프레임 단위 애니메이션은 Canvas가 소유한다.

## Render Function Shape

```ts
type RenderContext = {
  now: number;
  battle: BattleViewState;
  layout: BattleLayout;
};

function drawChartLayer(ctx: CanvasRenderingContext2D, view: RenderContext): void;
function drawFxLayer(ctx: CanvasRenderingContext2D, view: RenderContext): void;
function drawCharacterLayer(ctx: CanvasRenderingContext2D, view: RenderContext): void;
```

## Rules

- 같은 state면 같은 프레임 결과가 나와야 한다.
- route 파일은 render loop를 직접 소유하지 않는다.
- 원시 수치는 `config.ts` 같은 상수 계층에서만 읽는다.
- Canvas API 호출 전 좌표와 반지름은 `Number.isFinite()`로 검증한다.
- `arc()` 반지름은 음수가 되면 안 된다.
- interactive UI는 Canvas 위에 DOM으로 얹고, 게임 판정은 engine/store가 한다.

## Order

1. history와 terrain 배경
2. active slice 강조
3. hazard, path, objective overlay
4. units and hit reactions
5. transient FX

## Done Means

- 차트가 배경 장식이 아니라 전장으로 읽힌다.
- `long`과 `short`의 압력 방향이 즉시 구분된다.
- Canvas 오류 없이 한 판을 끝까지 렌더링할 수 있다.
