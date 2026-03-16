# skill: score-engine

판단 품질 계산 TypeScript 모듈을 만들 때 쓴다.
위치: `src/lib/engine/resolver.ts`

이 파일의 로직을 라우트나 스토어에서 직접 구현하지 않는다.

---

## 입력 타입

```typescript
interface ResolveInput {
  direction:    'long' | 'short' | 'hold';
  entryPrice:   number;
  stopLoss:     number | null;
  futureCandles: Candle[];           // 진입 이후 캔들 (가격 불변)
  analysis:     ChartAnalysis;       // 진입 시점 차트 분석값
}
```

---

## 출력 타입

```typescript
type OutcomeType =
  | 'WIN_BIG' | 'WIN' | 'HOLD' | 'SCRATCH'
  | 'STOPPED' | 'LOSS' | 'LIQUIDATED';

interface BattleEvent {
  candle:  number;          // futureCandles 인덱스
  type:    'stop' | 'liq' | 'breakout' | 'breakdown' | 'resist' | 'support';
  message: string;
}

interface RewardPacket {
  xp:       number;
  bond:     number;         // Scout bond 변화량 (음수 가능)
  gold:     number;         // 음수 = 손실
  hpDelta:  number;
  memories: string[];       // 메모리 카드 텍스트 배열
}

interface ResolveResult {
  outcome:       OutcomeType;
  pnlPct:        number;
  exitPrice:     number;
  exitReason:    string;
  qualityScore:  number;    // 0~100
  events:        BattleEvent[];
  rewards:       RewardPacket;
}
```

---

## 판단 품질 점수 계산식 (확정값)

```typescript
function calcQualityScore(
  direction: string,
  regime: Regime,
  hasStopLoss: boolean,
  outcome: OutcomeType
): number {
  let score = 50;

  // 레짐 일치 보너스/페널티
  const regimeBonus: Record<Regime, number> = {
    TRENDING_UP:   direction === 'long'  ? 20 : direction === 'hold' ? 0 : -15,
    TRENDING_DOWN: direction === 'short' ? 20 : direction === 'hold' ? 0 : -15,
    RANGING:       direction === 'hold'  ? 8  : 0,
    VOLATILE:      direction === 'hold'  ? 15 : -5,
  };
  score += regimeBonus[regime] ?? 0;

  // 손절 설정 보너스
  if (hasStopLoss) score += 10;

  // 결과 반영
  const outcomeBonus: Record<OutcomeType, number> = {
    WIN_BIG:    20, WIN: 12, HOLD: 5, SCRATCH: 0,
    STOPPED:   -5,  LOSS: -15, LIQUIDATED: -25,
  };
  score += outcomeBonus[outcome] ?? 0;

  return Math.max(0, Math.min(100, score));
}
```

---

## 보상 계산식 (확정값)

```typescript
function calcRewards(outcome: OutcomeType, qualityScore: number): RewardPacket {
  const xp   = Math.max(5, Math.round(qualityScore * 0.8));
  const bond = outcome === 'WIN_BIG' || outcome === 'WIN' ? 15
             : outcome === 'LIQUIDATED' ? -10 : 5;
  const gold = { WIN_BIG: 200, WIN: 100, HOLD: 20, SCRATCH: 10,
                 STOPPED: -50, LOSS: -80, LIQUIDATED: -150 }[outcome] ?? 0;
  const hpDelta = { WIN_BIG: 10, LIQUIDATED: -30, LOSS: -10 }[outcome as string] ?? 0;

  return { xp, bond, gold, hpDelta, memories: [] };
}
```

---

## 이벤트 감지 순서

```
각 futureCandle에 대해 순서대로 체크:
1. 손절 발동 (direction === 'long' && low <= stopLoss)
2. 청산 구간 진입 (direction === 'long' && low <= liqZone)
3. 저항선 도달 (direction === 'long' && high >= resist)
4. 지지선 도달 (direction === 'short' && low <= support)
5. 기간 만료 (futureCandles 전부 소화)

1 또는 2 발동 시 즉시 루프 종료.
```

---

## 절대 규칙

- 이 모듈에 난수 없음. 동일 입력 = 동일 출력.
- futureCandles는 읽기만 함. 수정 금지.
- 결과는 반드시 `rosterStore.applyRewards(result)` 경유로만 적용.
- 라우트 또는 컴포넌트에서 직접 점수 계산 금지.
