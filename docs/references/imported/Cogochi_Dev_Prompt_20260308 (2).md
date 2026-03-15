# Cogochi 구현 지시 프롬프트 (완성형)

> **사용법:** 이 파일 전체를 Claude Code 또는 Codex 세션 시작 시 붙여넣는다.  
> 이후 스프린트 지시는 맨 아래 [SPRINT COMMAND] 섹션을 수정해서 붙인다.

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-03-08 | 초안 — 가이드 포맷 기준 Cogochi 완성형 |

---

## [ROLE]

너는 시니어 게임 디자이너, 시스템 기획자, 테크니컬 기획자, 그리고 시니어 프로토타입 엔지니어다.  
목표는 단순한 샘플 게임이나 장난감 수준의 데모를 만드는 것이 아니라, **실제로 확장 가능한 게임 프로토타입을 설계하고 구현 가능한 수준까지 구체화**하는 것이다.

**절대 원칙:**
- 임의로 내용을 단순화하지 말 것
- 흔한 기본 패턴으로 축소하지 말 것
- 추상적 설명으로 얼버무리지 말 것. 반드시 규칙·상태·수치·조건·예외처리로 설명
- 비어 있는 정보는 합리적 기본값을 직접 제안하고 이유 명시
- placeholder / TODO로 끝내지 말 것
- 구현 전 설계와 작업 분해 먼저
- 전체를 한 번에 만들지 말고, 이번 스프린트 범위만 집중
- 각 시스템은 다른 시스템과 어떻게 연결되는지 포함

---

## [DOCUMENT A] GAME VISION

### A1. 게임 한 줄 요약
내가 직접 훈련시킨 AI 에이전트 4명이 실제 BTC 차트 위 지형에서 싸우는 턴제 배틀 시뮬레이터.  
에이전트의 학습 방식(독트린·메모리·파인튜닝)이 배틀 결과를 직접 바꾼다.

### A2. 핵심 판타지 (3개 — 우선순위 순)
1. **"이건 내 에이전트다"** — 내 독트린과 메모리 설정이 배틀 장면에 그대로 표현됨
2. **"내 판단이 승패를 가른다"** — 결정적 순간 스킬 선택이 흐름을 바꿈
3. **"왜 졌는지 안다"** — Reflection 카드가 다음에 뭘 바꿀지 1줄로 알려줌

### A3. 타겟 플레이어
- 포켓몬·하데스류 배틀 시뮬 좋아하는 플레이어
- AI·LLM에 관심 있고 "내가 모델을 튜닝한다"는 판타지에 반응하는 플레이어
- 암호화폐 차트를 이미 아는 플레이어 (용어 설명 없이 읽힘)

### A4. 핵심 재미 3가지
1. **표현 만족** — 내 독트린 설정이 캐릭터 행동으로 보임
2. **전략 챌린지** — 결정적 순간 스킬 선택의 리스크·보상
3. **학습 루프** — 패배 → Reflection → 설정 변경 → 재도전이 자연스럽게 이어짐

### A5. Anti-Fantasy (이 느낌 나오면 설계가 틀림)
- "숫자 올라가는 거 구경했다" → 플레이어 개입이 1회도 없으면 안 됨
- "어차피 자동이라 내 설정 무관했다" → 독트린 차이가 화면에서 달라보여야 함
- "왜 졌는지 모르겠다" → Reflection이 추상적이면 안 됨

### A6. 레퍼런스
- **배틀 연출**: ROBO Trading Challenge — 차트 위 캐릭터가 직접 싸움
- **캐릭터 표현**: Stardew Valley — 탑다운 픽셀, 걷기/공격/대시 애니메이션
- **개입 구조**: 포켓몬 — 평소 자동, 결정적 순간만 스킬 4개 선택
- **AI 루프**: Tamagotchi × fine-tuning — 내가 키우는 모델이 배틀 행동을 바꿈

### A7. Design Pillars
| # | Pillar | 의미 |
|---|---|---|
| 1 | 에이전트 정체성 | 이름 있는 캐릭터, 역할이 시각적으로 다름 |
| 2 | 준비가 결과를 만든다 | 독트린·메모리·스킬 설정이 배틀 수치 직접 변경 |
| 3 | 읽히는 배틀 | 5초 안에 "지금 누가 이기고 있는지" 파악 가능 |
| 4 | 배울 수 있는 실패 | Reflection이 구체적 다음 행동 제시 |

### A8. Anti-Pillars (절대 금지)
- 실제 트레이딩 UI 흉내
- 복잡한 인벤토리 관리
- 수동 조작 과잉 (매 프레임 클릭)
- 배틀 결과와 에이전트 설정이 무관한 구조

---

## [DOCUMENT B] SYSTEMS DESIGN

> 각 시스템은 목적·상태·입력·출력·수치·실패처리·연결 7개를 반드시 포함한다.

---

### B1. Agent Identity System

**목적:** 에이전트가 "설정값 묶음"이 아니라 캐릭터로 느껴지게 한다.  
**플레이 경험상 역할:** 소유감·애착 형성. "내 에이전트" 판타지의 기반.

**상태:** `IDLE | TRAINING | IN_BATTLE | REFLECTING | LOCKED`

**상태 전이 조건:**
- IDLE → TRAINING: 플레이어가 Doctrine/Memory 편집 시작
- IDLE → IN_BATTLE: 스쿼드에 포함되어 배틀 시작
- IN_BATTLE → REFLECTING: 배틀 종료
- REFLECTING → IDLE: Reflection 카드 확인 완료
- LOCKED: 레벨 조건 미달 스킬·역할 접근 시도

**입력:** 플레이어 에디터(이름·독트린·메모리 편집) / 배틀 결과 / XP 획득 이벤트  
**출력:** 배틀 중 행동 파라미터 / 렌더링 데이터 / Reflection 입력값

**핵심 규칙:**
- FunctionalRole(SCOUT/ANALYST/RISK/EXECUTOR) = 스쿼드 전략 역할
- ExpressionRole(PUSHER/CRUSHER/GUARDIAN/BREAKER/TRAPPER/RIDER/ORACLE/MAW) = 배틀 시각 표현
- 두 역할은 독립. SCOUT이 CRUSHER 표현 가능

**수치:**
```
XP 레벨업: level * 100 (Lv1→2: 100, Lv5→6: 500, Lv10→11: 1000)
Bond 증가: 배틀참여+2 / 승리+3 / Reflection완료+5
Bond 감소: 연패3회-5 / 미사용7일-3
MemoryBank 최대: 50개 (초과 시 bond낮은 순 자동 압축)
```

**예외 처리:**
- 이름 미입력 → `AGENT_${id.slice(0,4).toUpperCase()}`
- ExpressionRole 미설정 → FunctionalRole 기준 기본 매핑
  (SCOUT→RIDER, ANALYST→ORACLE, RISK→GUARDIAN, EXECUTOR→PUSHER)

**다른 시스템과의 연결:**
- DoctrineSystem: agent.doctrine → 배틀 hesitateChance·objPerHit 결정
- ProgressionSystem: xp·level·bond → 스킬·역할 해금
- BattleEngine: expressionRole → 렌더링 스프라이트·애니메이션 선택
- ReflectionSystem: battle trace → memory writeback

**구현 시 주의점:** AgentInstance는 immutable update 패턴. 배틀 중 직접 변경 금지.  
**확장 가능한 부분:** 파인튜닝 artifact 연결 / 전용 signature move / 진화 스킨

---

### B2. Doctrine System

**목적:** 플레이어가 에이전트 "성향"을 설정. 배틀 결과에 직접 영향.  
**플레이 경험상 역할:** "내 설정이 달라지면 배틀이 달라진다"는 체감의 핵심.

**상태:** `SELECTED | LOCKED(배틀 중)`

**입력:** 플레이어 선택 (배틀 전 전용)  
**출력:** hesitateChance / objPerHit / confMod → BattleEngine 전달

**핵심 규칙:**
- 배틀 시작 후 변경 불가 (LOCKED)
- 다음 배틀 전 자유 변경 가능
- Reflection 카드에서 "독트린 변경 권고" 출력 가능

**수치 (확정값 — 임의 변경 금지):**
| id | hesitate | objPerHit | confMod | 최적 상황 |
|---|---|---|---|---|
| AGGRESSIVE | 0.08 | 9 | +0.12 | 강한 추세 |
| DEFENSIVE | 0.50 | 4 | -0.04 | 고변동성 |
| TREND | 0.25 | 6 | +0.04 | MA 배열 |
| CONTRARIAN | 0.40 | 7 | +0.08 | 역추세 |

**예외 처리:** 미설정 시 AGGRESSIVE 기본값  
**다른 시스템과의 연결:** BattleEngine CAST phase / Reflection 실패 분류  
**확장 가능한 부분:** 에이전트별 커스텀 독트린 파라미터 편집

---

### B3. Battle Phase Engine

**목적:** 배틀을 6 Phase 루프로 진행. 각 Phase마다 특정 에이전트가 역할 수행.  
**플레이 경험상 역할:** 긴장-완화-결정의 리듬. 포켓몬 턴 구조의 리얼타임 버전.

**상태:** `SCAN | RECALL | PLAN | CAST | CLASH | RESOLVE`

**상태 전이:**
```
SCAN(2.2s) → RECALL(1.8s) → PLAN(1.5s) → CAST(2.0s) → CLASH(2.2s) → RESOLVE(1.8s)
     └──────────────────────────────────────────────────────────────────────┘
     1 round = 6 phases / 8 rounds = 1 battle (총 약 4.5분)
```

**입력:** 이전 Phase 결과 / 플레이어 카드 사용 여부  
**출력:** 에이전트 action 상태 / OBJ 수치 변화 / 배너 메시지 / 이펙트 트리거

**핵심 규칙 (Phase별):**

| Phase | 담당 | 조건 | 출력 |
|---|---|---|---|
| SCAN | SCOUT | 항상 실행 | 오른쪽 전력질주 + OBJ 정보 갱신 |
| RECALL | ANALYST | 항상 실행 | 메모리 펄스 + confidence 조정 |
| PLAN | 전체 | 항상 실행 | 포지션 이동 + 독트린 배너 |
| CAST | EXECUTOR | hesitate 체크 | 공격 준비 또는 망설임 |
| CLASH | EXECUTOR | CAST 성공 시 | 공격 실행 + OBJ 증가 |
| RESOLVE | 전체 | 항상 실행 | HP 정산 + 라운드 종료 |

**CAST 상세 분기:**
```
if (random() < doctrine.hesitate && !focusCard)
  → executor.action = HESITATE, BS.hes++
else
  → executor.action = CAST
  → CLASH에서 doClash() 실행
  → if critNext: damage *= 1.5
```

**배틀 종료 조건:**
```
OBJ >= 100 → VICTORY
Round 8 종료 + OBJ < 50 → DEFEAT
Round 8 종료 + OBJ >= 50 → VICTORY (간신히)
executor.hp <= 0 → DEFEAT
```

**수치:**
```
Phase 지속시간: [2200, 1800, 1500, 2000, 2200, 1800] ms
hitStop: 충격 시 dt = rdt * 0.03 (90프레임)
doClash 기본 데미지: 12 + executor.conf * 18
rivalAtk 기본 데미지: 12 + crusher.conf * 8 (아군 HP에 0.5 배율)
```

**예외 처리:**
- phaseTimer 중복: 항상 clearTimeout 후 setTimeout
- hitStop 중: 파티클만 감속, Phase 타이머는 정상 진행

**다른 시스템과의 연결:**
- DoctrineSystem: hesitateChance → CAST 분기
- SkillSystem: focusCard / vetoCard → CAST/CLASH 수정
- ChartTerrain: 캔들 지형 → 에이전트 grounding Y좌표
- ProgressionSystem: 배틀 종료 → XP 지급

**구현 시 주의점:** phaseTimer는 반드시 battleStore에서 관리. 컴포넌트 직접 관리 금지.  
**확장 가능한 부분:** Ollama AI 추론 → CAST phase 결정 교체

---

### B4. Skill (Pokémon) Intervention System

**목적:** "평소 자동, 결정적 순간만 플레이어 선택" 구현.  
**플레이 경험상 역할:** 수동 개입의 긴장감. 선택의 결과를 즉시 확인.

**상태:** `WAITING_INPUT | EXECUTING | COOLDOWN`

**트리거:** CAST Phase 직전 (8라운드 중 선택적으로 출현)  
**입력:** 플레이어 스킬 버튼 클릭  
**출력:** 스킬 효과 실행 + PP 감소 + 메시지 큐 진행

**핵심 규칙:**
- 스킬 메뉴: CAST Phase 전에만 표시
- PP = 0인 스킬: disabled (선택 불가)
- 선택 후 300ms 딜레이 → 스킬 이름 팝업 → 효과 실행 → 적 턴 자동 진행
- 배틀 종료 후 PP 전체 초기화

**EXECUTOR 스킬 4개:**
| 이름 | 타입 | PP | 효과 |
|---|---|---|---|
| BREAKOUT | BULL | 10/10 | doClash() + OBJ +12 |
| MOMENTUM | BULL | 8/8 | executor.conf +0.15, OBJ +8 |
| SHORT TRAP | BEAR | 6/6 | crusher.conf -0.20 |
| CONSOLIDATE | HOLD | 5/5 | 아군 전체 HP +20 |

**SCOUT 스킬 4개:**
| 이름 | 타입 | PP | 효과 |
|---|---|---|---|
| SCAN WIDE | INFO | 15/15 | OBJ +5, 스카우트 전력질주 |
| PINPOINT | BULL | 8/8 | critNext = true |
| DODGE | HOLD | 10/10 | dodgeNext = true |
| SIGNAL | INFO | 6/6 | 아군 전체 conf +0.10 |

**레거시 카드 (키보드, 항상 사용 가능):**
| 키 | 이름 | 효과 | 쿨다운 |
|---|---|---|---|
| F | FOCUS | executor.conf +0.20 | 8s |
| M | MEMORY | 아군 전체 conf +0.10 | 8s |
| V | VETO | 다음 CLASH 차단 (1회) | — |
| R | RETARGET | OBJ +10 | 8s |
| D | BOOST | 아군 전체 conf +0.10 | 8s |

**예외 처리:**
- 스킬 선택 후 배틀 즉시 종료: 효과 무시, 결과 화면 표시
- 타이프라이터 메시지 중 클릭: 즉시 완성 + 다음으로

**다른 시스템과의 연결:**
- BattlePhaseEngine: CAST Phase에 critNext/dodgeNext 플래그 전달
- ChartTerrain: MOMENTUM 시 이펙트 위치 계산
- ProgressionSystem: 스킬 사용 횟수 → XP +5/회

**구현 시 주의점:** pbState는 battleStore와 분리 관리. 포켓몬 UI 상태와 배틀 엔진 상태 혼합 금지.

---

### B5. Chart Terrain System

**목적:** 가격 캔들 데이터를 배틀 지형으로 변환. "차트가 전장이다"의 물리적 구현.  
**플레이 경험상 역할:** 시장 상황이 지형으로 읽힘. 에이전트가 캔들 위를 걷는 시각.

**상태:** `INITIALIZING | ACTIVE | UPDATING(라운드마다 캔들 추가)`

**입력:** 합성 캔들 데이터(MVP) / Binance API 실제 데이터(Post-MVP)  
**출력:** pY(price) → Y픽셀 / groundAtX(x) → 에이전트 grounding Y / BattleZone 배열

**핵심 변환 함수:**
```ts
function pY(price: number): number {
  const range = priceMax - priceMin
  if (!isFinite(price) || isNaN(price)) return CTOP + CH * 0.5
  const safeRange = range < 1e-8 ? 2 : range  // 최소 범위 보장
  return CTOP + CH * (1 - (price - priceMin) / safeRange)
}

function groundAtX(x: number): number {
  const i = Math.max(0, Math.min(Math.floor(x / (W / NC)), candles.length - 1))
  const y = pY(candles[i].c)
  return isFinite(y) ? y : CTOP + CH * 0.7
}
// 에이전트 Y = groundAtX(x) - 24
```

**존 생성 규칙:**
```
저항선(resistance): 최근 5개 고점(candle.h) 평균
지지선(support):    최근 5개 저점(candle.l) 평균
청산존(liquidation): 저항선 - (저항-지지) * 0.30 구간
브레이크아웃(breakout): 저항선 + (저항-지지) * 0.15
```

**수치:**
```
캔들 수(NC): 26개
캔들 폭(cW): W / NC * 0.7
가격 패딩: (priceMax - priceMin) * 0.15 (상하 여백)
합성 캔들 변동폭: 기준가 * 0.02 (±2%)
```

**방어 코드 필수 3곳:**
```ts
// 1. arc() 음수 반지름 방지
p.life -= p.dec * dt
if (p.life <= 0) return false  // 그리기 전에 return
ctx.arc(x, y, Math.max(0, p.sz * p.life), 0, Math.PI * 2)

// 2. createLinearGradient NaN 방지
const y = pY(price)
if (!isFinite(y)) return

// 3. priceMax = priceMin 방지 (초기 1캔들 상태)
const safeRange = range < 1e-8 ? 2 : range
```

**다른 시스템과의 연결:**
- AgentMovement: groundAtX() → 에이전트 발 위치
- BattlePhaseEngine: BattleZone 위치 → CLASH 타겟 좌표
- ProgressionSystem: Stage 클리어 → 다음 캔들 시드 변경

**확장 가능한 부분:** Binance WebSocket 실시간 데이터 교체 / 시나리오별 캔들 시드 고정

---

### B6. Agent Movement & Rendering System

**목적:** 에이전트 8명을 차트 지형 위에서 이동·렌더링. 역할별 외형 차별화.  
**플레이 경험상 역할:** "내 에이전트가 직접 움직인다"는 물리적 존재감.

**상태 (에이전트별):**
```
action: 'idle' | 'walk' | 'run' | 'attack' | 'hit' | 'dead'
facing: 1 (오른쪽) | -1 (왼쪽)
onGround: boolean
jumpV: number (수직 속도, -8 = 점프)
flash: number (피격 시 흰색 오버레이 프레임)
hes: boolean (망설임 상태 — 떨림 애니메이션)
conf: number (0~1, 오라 글로우 강도)
hp: number (0~100)
```

**이동 물리:**
```ts
// 매 프레임
agent.x += agent.vx * dt * 60
agent.y += agent.jumpV * dt * 60
agent.jumpV += 0.4  // 중력
const ground = groundAtX(agent.x) - 24
if (agent.y >= ground) {
  agent.y = ground
  agent.jumpV = 0
  agent.onGround = true
}
// 목표 위치 추적 (tx)
agent.x += (agent.tx - agent.x) * 0.08
```

**스프라이트 규칙:**
| 역할 | 색상 | 장식 | Phase별 특징 행동 |
|---|---|---|---|
| SCOUT/Kira | #00e5ff | 안테나 | SCAN: 오른쪽 전력질주 |
| ANALYST/Nova | #9966ff | 안경 | RECALL: 메모리 펄스 링 |
| RISK/Aegis | #00ff88 | 방패 | 피격 시 실드 이펙트 |
| EXECUTOR/Apex | #ffaa00 | 검 | CLASH: 점프 + 충격파 |
| CRUSHER/Dread | #ff2040 | 망치 | 반격 발사체 |
| TRAPPER/Lure | #ff6b35 | 가시 | 청산존 근처 배치 |
| MAW/Void | #ff00aa | 큰 입 | 청산 시 확대 |
| BREAKER/Spike | #cc1f42 | 스파이크 | 저항선 붕괴 시 돌진 |

**수치:**
```
walk 속도: 1.2 px/frame
run 속도: 2.8 px/frame
점프 초속: -8
중력: +0.4/frame
conf 오라 임계값: 0.8 (이상 시 글로우 링)
hesitate 흔들림: sin(Date.now() * 0.04) * 1.5 px
```

**다른 시스템과의 연결:**
- ChartTerrain: groundAtX() → Y 위치
- BattlePhaseEngine: action 상태 변경
- ParticleSystem: 이펙트 트리거 좌표 전달

---

### B7. Particle & Effect System

**목적:** 공격·피격·스킬 사용의 시각적 피드백 제공.  
**플레이 경험상 역할:** 타격감·만족감의 물리적 표현.

**파티클 타입:**
```ts
type Particle =
  | { type: 'dot';  x, y, vx, vy, life, dec, sz, col }
  | { type: 'ring'; x, y, r, life, dec, col }
```

**렌더링 규칙:**
```ts
// dot: life 먼저 감소, 0 이하면 그리기 전 return
p.life -= p.dec * dt
if (p.life <= 0) return false
ctx.arc(x, y, Math.max(0, p.sz * p.life), ...)

// ring: r 증가, life 감소
p.r += 3 * dt * 30
p.life -= p.dec * dt
if (p.life <= 0) return false
if (p.r > 0) ctx.arc(x, y, p.r, ...)
```

**이펙트 프리셋:**
| 이름 | 호출 시점 | 파티클 수 | 색상 |
|---|---|---|---|
| sExp(x,y) | CLASH 히트 | 22개 dot + 1 ring | 빨강/주황/노랑 |
| sBlood(x,y) | 피격 | 8개 dot | 빨강 |
| sPts(x,y,col,n,spd) | 메모리 펄스 등 | n개 | 지정색 |

**동시 표시 최대값:**
```
파티클: 80개 (초과 시 오래된 것부터 제거)
발사체: 5개
플로팅 텍스트: 3개
```

---

### B8. Stage Map System

**목적:** 스테이지 선택 → 독트린 선택 → 배틀 진입 플로우.  
**플레이 경험상 역할:** 진행감·클리어 성취감.

**상태:** `LOCKED | UNLOCKED | CLEARED`

**잠금 해제 규칙:**
- Stage 1: 항상 UNLOCKED
- Stage N+1: Stage N이 CLEARED일 때 UNLOCKED
- CLEARED 상태: localStorage 저장

**스테이지 데이터:**
| id | 이름 | Zone | 코인 | 적군 | Lv | 주요 지형 | 보상 |
|---|---|---|---|---|---|---|---|
| s1 | FIRST CANDLE | 1 | BTC | NEWBIE BEAR | 3 | 저항선 1개 | XP+50, SCOUT해금 |
| s2 | RANGE TRAP | 1 | ETH | RANGE KEEPER | 5 | 박스권 | XP+80, MOMENTUM해금 |
| s3 | BULL AWAKENING | 1 | BTC | TREND CHASER | 7 | MA 돌파 | XP+120, 레벨업 |
| s4 | LIQUIDATION ZONE | 2 | SOL | LIQUIDATOR | 10 | 청산존 | XP+180, SHORT TRAP해금 |
| s5 | FUD STORM | 2 | ETH | FUD SPREADER | 13 | 변동성 폭풍 | XP+220, VETO강화 |
| s6 | BREAKOUT | 2 | BTC | WALL GUARDIAN | 16 | 브레이크아웃 게이트 | XP+300, APEX진화 |
| s7 | DOUBLE TOP | 3 | BTC | PATTERN MASTER | 20 | 이중 저항 | XP+400, 팀강화 |
| s8 | THE APEX | 3 | BTC | MARKET ITSELF | 30 | 전체 지형 | XP+1000, 시즌클리어 |

---

### B9. Reflection System

**목적:** 배틀 후 "다음에 뭘 바꿀지"를 1줄로 알려줌. 추상적 피드백 금지.  
**플레이 경험상 역할:** 패배가 좌절이 아니라 "이제 뭘 해야 하는지 앎"으로 전환됨.

**분류 로직 (우선순위 순):**
```ts
function classify(bs): ReflectionNote {
  if (bs.hes >= 3) return {
    cause: `EXECUTOR ${bs.hes}회 망설임 — Doctrine 불일치`,
    action: `AGGRESSIVE 교체 후 재도전`,
    lesson: `hesitate ${bs.hes}회 = doctrine이 시장과 안 맞음`
  }
  if (bs.obj < 30) return {
    cause: `OBJ ${bs.obj}% — 공격 기회 미생성`,
    action: `Round 2~3에 FOCUS + RETARGET 동시 사용`,
    lesson: `초반 OBJ 쌓기가 핵심. 카드 아끼지 말 것`
  }
  if (bs.round >= 8 && bs.obj < 50) return {
    cause: `시간초과. Round ${bs.round} OBJ ${bs.obj}%`,
    action: `SCAN WIDE + MOMENTUM 콤보로 초반 가속`,
    lesson: `Round 4 시점 OBJ 40% 목표`
  }
  return { // 승리
    cause: `Doctrine "${doctrine.label}" 적중`,
    action: `이 설정으로 다음 스테이지 도전`,
    lesson: `EXECUTOR conf ${Math.round(executor.conf*100)}%. 승리 패턴 저장됨`
  }
}
```

**표시 항목 (4개 필수):**
1. 결과 (VICTORY / DEFEAT) + 색상
2. 통계 4개: OBJ% / ROUNDS / HESITATE횟수 / CARDS사용
3. ROOT CAUSE (1~2줄)
4. LESSON (다음 배틀에서 바꿀 것 1줄)

---

### B10. Progression System

**목적:** 에이전트 성장을 시각화. 반복 플레이 동기 제공.  
**플레이 경험상 역할:** "이 에이전트가 점점 강해지고 있다"는 누적감.

**XP 획득 이벤트:**
| 이벤트 | XP |
|---|---|
| 배틀 참여 | +30 |
| 승리 | +50 |
| OBJ >= 70% | +20 |
| Hesitate 0회 | +15 |
| 스킬 사용 1회 | +5 |
| Reflection 완료 | +25 |

**레벨별 해금:**
| Lv | 해금 |
|---|---|
| 2 | SCOUT 스킬 2번째 |
| 3 | Doctrine 4종 모두 접근 |
| 5 | EXECUTOR 스킬 3번째 |
| 7 | Signature Move 1개 |
| 10 | ExpressionRole 변경 가능 |
| 15 | Ollama fine-tune 루프 접근 |

**Bond 임계값 효과:**
```
Bond >= 50: conf 자연 회복 +0.01/phase
Bond >= 80: Signature Move 데미지 +20%
Bond >= 100: 전용 오라 비주얼 해금
```

---

### B11. AI Runtime System (Ollama)

**목적:** 규칙 기반 배틀을 Qwen3-1.7B 실제 추론으로 교체.  
**MVP에서는 규칙 기반 동작 — Ollama 미설치 시 자동 fallback.**

**입력 계약:**
```ts
interface AgentDecisionInput {
  scenarioState: { candleData: CandleSlice[], zones: BattleZone[], objective: number, round: number }
  agentContext:  { role, doctrine, confidence, hp, retrievedMemory: MemoryRecord[] }
  squadContext:  { allyStates, rivalStates }
}
```

**출력 계약:**
```ts
interface AgentDecisionOutput {
  intent: 'ATTACK' | 'DEFEND' | 'SUPPORT' | 'RETREAT' | 'HESITATE'
  confidence: number
  reasoning: string       // Reflection에 표시
  memoryInfluence: string | null
}
```

**실패 처리:**
```ts
// timeout: 2000ms
// fallback: { intent: 'HESITATE', confidence: 0.3, reasoning: 'timeout' }
// JSON 파싱 실패: 동일 fallback
// Ollama 미설치: 규칙 기반 전환 + 상단 배너 알림
```

---

## [DOCUMENT C] CONTENT & PRESENTATION

### C1. 배틀 연출 레이어 구조 (z-index 순)

```
Layer A (ctxChart):  캔들 차트 — 지형, MA7/MA25, 볼륨바
Layer B (ctxFx):     전장 존 — 저항선(빨강), 지지선(초록), 청산존(분홍), 브레이크아웃(금색)
Layer C (ctxChar):   에이전트 8명 — 픽셀 스프라이트, 물리 이동
Layer D (ctxFx):     파티클·발사체·플로팅텍스트
Layer E (DOM fixed): HUD (상단 페이즈·라운드·OBJ / 하단 카드)
Layer F (DOM fixed): 포켓몬 UI — HP바·메시지창·스킬메뉴 (z:30)
Layer G (DOM fixed): 인트로 연출 (z:200)
```

### C2. 화면 동시 표시 밀도 규칙

배틀 화면에서 플레이어가 5초 안에 파악해야 하는 것:
1. **누가 이기고 있는지** → OBJ 바
2. **지금 어느 Phase인지** → Phase 표시
3. **어떤 에이전트가 행동 중인지** → 에이전트 이름 + 행동 배너
4. **위험 요소가 어디인지** → 존 레이어

동시 표시 최대:
- 파티클: 80개 / 발사체: 5개 / 플로팅텍스트: 3개 / 배너: 1개

### C3. 오디오 사양

| 이벤트 | 주파수 | 파형 | 볼륨 | 구현 |
|---|---|---|---|---|
| Phase 전환 | 500Hz | square | 0.04 | beep() |
| 공격 히트 | 노이즈 | buffer | 0.22 | sfxHit(true) |
| 피격 | 노이즈 | buffer | 0.12 | sfxHit(false) |
| 대시 | 320Hz | sawtooth | 0.07 | sfxDash() |
| 승리 | 523→659→784→1047Hz | triangle | 0.10 | sfxVic() |
| 패배 | 280→190→140Hz | sawtooth | 0.06 | sfxDef() |
| 스킬 선택 | 700Hz | square | 0.06 | beep() |
| 타이프라이터 틱 | 660/880Hz 교차 | square | 0.015 | 메시지당 |

모든 오디오: Web Audio API 직접 합성. 외부 파일 없음.

---

## [DOCUMENT D] IMPLEMENTATION CONSTRAINTS

### D1. 기술 스택 (고정 — 변경 금지)

```
프론트엔드:    SvelteKit 2 / Svelte 5 (runes 문법 $state/$derived/$effect)
언어:          TypeScript 5 strict mode
빌드:          Vite
스타일:        CSS (Tailwind/CSS-in-JS 금지)
영속성:        localStorage (MVP)
AI 런타임:     Ollama HTTP API (port 11434) + 규칙 기반 fallback
AI 모델:       Qwen3-1.7B (로컬)
파인튜닝:      mlx-lm + mlx-lm-lora (ORPO, M1 Max 64GB)
배틀 렌더링:   HTML5 Canvas 2D (3레이어 ctxChart/ctxFx/ctxChar)
```

### D2. 폴더·모듈 구조 (확정)

```
src/
  routes/
    +page.svelte                    # 홈 (Agent Ops Hub)
    roster/+page.svelte             # 에이전트 목록
    agent/[id]/+page.svelte         # 에이전트 상세·훈련
    team/+page.svelte               # 스쿼드 구성
    battle/+page.svelte             # 배틀 화면 진입점
    map/+page.svelte                # 월드맵
    lab/+page.svelte                # 파인튜닝 랩
  components/
    battle/
      BattleCanvas.svelte           # 3레이어 Canvas + 게임루프
      PhaseHUD.svelte               # 페이즈·라운드·OBJ 표시
      SkillMenu.svelte              # 포켓몬식 스킬 4개 메뉴
      HPBars.svelte                 # 좌우 HP 바
      MessageBox.svelte             # 하단 타이프라이터 메시지
      IntroSequence.svelte          # 배틀 시작 인트로
      ReflectionCard.svelte         # 배틀 후 결과 카드
    map/
      WorldMap.svelte               # 스테이지 노드 Canvas
      StageInfoPanel.svelte         # 하단 스테이지 정보
      DoctrineSelector.svelte       # 입장 전 독트린 선택
    agent/
      AgentCard.svelte              # 에이전트 카드 컴포넌트
      BondBar.svelte                # Bond 게이지
      XPBar.svelte                  # XP·레벨 표시
    shared/
      Banner.svelte                 # 상단 알림 배너
  lib/
    battle/
      engine.ts                     # Phase 스테이트머신
      terrain.ts                    # 캔들→지형 변환 (pY, groundAtX)
      agents.ts                     # 에이전트 이동·물리
      particles.ts                  # 파티클·이펙트·발사체
      audio.ts                      # Web Audio API 합성
      skills.ts                     # 스킬 정의·PP 관리
    ai/
      ollamaProvider.ts             # Ollama HTTP 클라이언트
      contextAssembler.ts           # 컨텍스트 조립
      reflectionService.ts          # Reflection 분류·생성
      memoryService.ts              # 메모리 CRUD
    stores/
      playerStore.svelte.ts         # 계정·리서치포인트
      rosterStore.svelte.ts         # 에이전트 목록
      squadStore.svelte.ts          # 스쿼드 구성
      battleStore.svelte.ts         # 배틀 상태 전체
      mapStore.svelte.ts            # 스테이지 진행도
    config.ts                       # 모든 수치 상수 (하드코딩 금지)
    types.ts                        # 전체 공통 타입
```

### D3. 코딩 규칙

- **하드코딩 금지**: 모든 수치는 `config.ts`에서 import
- **Svelte 5 runes**: `$state`, `$derived`, `$effect` 사용. `writable` 금지
- **상태 소유**: 각 store가 자기 상태만 소유. route 파일에 로직 없음
- **Canvas vs DOM**: 애니메이션 → Canvas. 클릭 가능 UI → DOM
- **arc() 방어**: Canvas 드로잉 함수는 `isFinite()` 입력 검증 필수
- **비동기**: Ollama 호출은 `try/catch` + 2000ms timeout + fallback 필수
- **immutable update**: AgentInstance 배틀 중 직접 변경 금지 (store 통해서만)

### D4. MVP 포함 범위

```
[완료] 월드맵 화면 + 스테이지 8개 (잠금/해제)
[완료] 독트린 선택 화면
[완료] 배틀 화면 (Canvas 3레이어)
[완료] 6-Phase 자동 배틀 루프
[완료] 포켓몬식 스킬 4개 선택
[완료] HP 바 (좌우) + OBJ 바
[완료] Reflection 카드
[완료] 스테이지 클리어 → 다음 해금

[Sprint 2] 에이전트 XP/레벨업
[Sprint 2] SvelteKit 컴포넌트 이식
[Sprint 3] Ollama 연결
[Sprint 4] 에이전트 상세 편집
```

### D5. MVP 제외 항목

- Binance 실시간 API 연결
- 파인튜닝 루프 (mlx-lm 연결)
- 멀티플레이어 PvP
- 에이전트 진화 비주얼
- 실제 픽셀아트 스프라이트 (현재 Canvas2D 도형)
- 사운드 BGM (현재 효과음만)

---

## [SPRINT COMMAND]

> **이 섹션을 수정해서 붙여넣으면 스프린트 지시가 됨**

```
위 설계를 기준으로, 지금은 전체를 만들지 말고 아래 스프린트 범위만 구현하라.

[Sprint 2 — SvelteKit 이식]

이번 범위:
1. src/lib/types.ts — AgentInstance, DoctrineConfig, Stage, BattleState 타입 전체
2. src/lib/config.ts — 모든 수치 상수 (Phase 지속시간, 스킬 PP, 독트린 수치 등)
3. src/lib/stores/battleStore.svelte.ts — Phase 스테이트머신 + Svelte 5 runes
4. src/components/battle/BattleCanvas.svelte — 기존 HTML 프로토타입 Canvas 로직 이식
5. src/routes/battle/+page.svelte — BattleCanvas + PhaseHUD + SkillMenu 조립

완료 조건:
- npm run dev 후 배틀 1판 완주 가능
- 독트린 선택 → 배틀 → Reflection 카드까지 흐름 동작

원칙:
- 각 파일 작성 전 역할 설명 먼저
- 하드코딩 수치는 config.ts에서 전부 import
- Svelte 5 runes ($state, $derived, $effect) 사용
- HTML 프로토타입 로직을 그대로 옮기되 Svelte 구조에 맞게 리팩터
```

---

## [APPENDIX A] 현재 설계에서 빠진 점

| # | 항목 | 영향 | 보완 방향 |
|---|---|---|---|
| 1 | 스쿼드 시너지 규칙 | 4명 조합이 수치에 영향 없음 | SCOUT+EXECUTOR 조합 시 hesitate -10% 등 조합 보너스 |
| 2 | 적군 AI 차별화 | 현재 crusher 단일 패턴 | 스테이지별 적군 doctrine 테이블 필요 |
| 3 | Signature Move 트리거 조건 | 레벨 7 해금만 있음 | "Bond 80 이상 + 특정 조건" 트리거 필요 |
| 4 | 메모리 품질 시각화 | 메모리 50개가 배틀에 어떻게 영향 주는지 불분명 | MemoryRecord별 relevance score 표시 |
| 5 | 패배 후 재시도 XP | 반복 패배 시 진행 불가 문제 | 패배 시에도 XP +15 최소 보장 |

## [APPENDIX B] 실제 개발 시 위험 요소

| # | 위험 | 발생 확률 | 대응 |
|---|---|---|---|
| 1 | Canvas arc() 음수 반지름 | 높음 | life 감소 후 그리기 전 `if (life <= 0) return false` 필수 |
| 2 | Ollama 응답 지연 (>2s) | 중간 | 2000ms timeout + 규칙 fallback 구현 필수 |
| 3 | Phase timer 누수 | 높음 | `clearTimeout(phT)` 항상 battleStore에서 관리 |
| 4 | 독트린 차이 체감 불가 | 중간 | AGGRESSIVE(0.08) vs DEFENSIVE(0.50) 수치 차이가 화면에서 보여야 함 |
| 5 | Svelte 5 runes + Canvas 조합 | 중간 | `$effect(() => { canvas setup })` + onMount 순서 주의 |
| 6 | localStorage 마이그레이션 | 낮음 | 스토어마다 버전 키 분리 (`cogochi.battle.v2` 등) |

## [APPENDIX C] 지금 바로 구현 가능한 최소 범위

**1시간 내 실행 가능:**
- `src/lib/types.ts` 작성 (AgentInstance, DoctrineConfig, Stage 타입)
- `src/lib/config.ts` 작성 (Phase 타이밍, 독트린 수치 이전)
- `src/lib/stores/battleStore.svelte.ts` 기본 Phase 루프

**2시간 내 실행 가능:**
- `BattleCanvas.svelte` — HTML 프로토타입 Canvas 로직 이식
- `battle/+page.svelte` — 컴포넌트 조립

**이 범위 완료 기준:**
"브라우저에서 `npm run dev` 실행 후 배틀 1판을 Reflection 카드까지 완주할 수 있다"

---

*Cogochi_Dev_Prompt_20260308.md — v1.0*  
*2026-03-08*

---

# [DOCUMENT B 보완] — 가이드 기준 누락 섹션

---

### B12. 조작 방식 상세 (Interaction Model)

**목적:** 플레이어가 어떤 입력을 언제 할 수 있는지 모든 경우를 정의.  
모델이 "클릭하면 됨" 수준으로 축소하지 못하게 막는다.

**입력 컨텍스트별 허용 조작:**

| 화면 상태 | 허용 입력 | 금지 입력 | 처리 방식 |
|---|---|---|---|
| 월드맵 | 마우스 클릭(노드), 호버(툴팁) | 키보드 스킬 | 클릭 → wmSelectStage() |
| 독트린 선택 | 마우스 클릭(카드), 버튼 클릭 | 키보드 | 카드 클릭 → curDoc 변경 |
| 인트로 연출 | 없음 (자동 진행) | 전부 | pointer-events: none |
| 배틀 — 자동 구간 | 키보드 F/M/V/R/D | 스킬 메뉴 | 카드 즉시 발동 |
| 배틀 — 스킬 메뉴 열림 | 마우스 클릭(스킬 버튼), 키보드 1/2/3/4 | F/M/V/R/D | 스킬 선택 → pbSelectSkill() |
| 메시지 진행 중 | 마우스 클릭(메시지창) | 스킬 선택 | 타이프라이터 즉시 완성 or 다음으로 |
| Reflection 화면 | 마우스 클릭(버튼 3개) | 키보드 스킬 | RETRY / NEXT / WORLD MAP |

**키보드 단축키 전체 (배틀 중):**
```
F → FOCUS 카드 (executor.conf +0.20)
M → MEMORY 카드 (전체 conf +0.10)
V → VETO 카드 (다음 CLASH 차단)
R → RETARGET 카드 (OBJ +10)
D → BOOST 카드 (전체 conf +0.10)
1/2/3/4 → 스킬 메뉴 열려 있을 때 스킬 선택
ESC → 스킬 메뉴 닫기 (선택 취소)
```

**입력 우선순위 (동시 입력 시):**
```
1. 스킬 메뉴 열려 있으면 → 스킬 입력만 처리
2. 메시지 진행 중이면 → 클릭은 메시지 진행, 키보드 카드는 큐에 저장
3. 배틀 over 상태이면 → 모든 게임 입력 무시, UI 버튼만 활성
```

**실패 처리:**
- 스킬 메뉴 외부 클릭: 메뉴 닫기 (ESC와 동일)
- 쿨다운 중 카드 키 입력: 시각 피드백(버튼 흔들림) + 무시
- 배틀 종료 후 키보드 카드: 무시 (BS.over 체크)

---

### B13. 적군 AI 상태머신

**목적:** 적군 4명이 단순 공격 반복이 아니라 상황에 반응하는 것처럼 보이게 한다.  
**현재 상태:** 규칙 기반(MVP). Ollama 연결 후 동일 인터페이스로 교체 가능.

**적군 에이전트 역할 분담:**
| 에이전트 | 역할 | 기본 행동 | 특수 조건 |
|---|---|---|---|
| CRUSHER/Dread | 메인 공격자 | CLASH 반격, 아군 공격 | OBJ > 60%이면 공격 강도 +30% |
| TRAPPER/Lure | 함정 배치자 | 청산존 근처에서 대기 | 아군이 청산존 진입 시 즉시 공격 |
| MAW/Void | 청산 특화 | 낮은 HP 아군 추적 | 아군 HP < 30이면 우선 타겟 |
| BREAKER/Spike | 저항선 수비 | 저항선 근처 순찰 | EXECUTOR가 저항선 접근 시 인터셉트 |

**CRUSHER 상태머신 (가장 복잡한 적):**
```
상태: IDLE | PATROL | AGGRO | ATTACKING | RECOVERING

IDLE → PATROL: 배틀 시작 후 0.5s
PATROL → AGGRO: EXECUTOR가 화면 중앙(W*0.5) 이상 접근 시
AGGRO → ATTACKING: CLASH Phase + 아군 미공격 상태
ATTACKING → RECOVERING: 발사체 발사 완료 후 0.3s
RECOVERING → PATROL: 1.2s 후
PATROL → IDLE: RESOLVE Phase 진입 시

PATROL 행동: x = W*0.65~0.85 구간을 좌우 왕복 (속도 1.0 px/frame)
AGGRO 행동: executor 위치로 접근 (속도 1.8 px/frame), 진입 배너 없음
ATTACKING 행동: sProj() 발사 → onHit 시 아군 HP -12~20
```

**적군 난이도 스케일링 (스테이지별):**
```ts
// 적군 데미지 배율
const enemyDmgMult = 0.5 + (stage.difficulty - 1) * 0.2
// stage.difficulty 1 → 0.5배, 3 → 0.9배, 5 → 1.3배

// 적군 반격 빈도
const rivalAtkInterval = 2200 - (stage.difficulty - 1) * 200
// difficulty 1 → 2200ms, 5 → 1400ms (매우 빠름)

// 적군 conf 기본값
const enemyBaseConf = 0.3 + (stage.difficulty - 1) * 0.1
// difficulty 1 → 0.3, 5 → 0.7
```

**MAW 특수 행동 (스테이지 4 이후 등장):**
```
조건: 아군 에이전트 hp < 30 AND 청산존 존재
행동: 해당 에이전트 방향으로 이동 (속도 2.5 px/frame)
      접근 시(거리 < 60px) → 잡기 이펙트 + HP -25
      잡기 성공 시 해당 에이전트 flash 600ms + 행동 불능 1s
```

**실패 처리:**
- 적군 타겟 에이전트 HP = 0이면 → 다른 아군 중 HP 최저 에이전트로 타겟 변경
- 적군 전원 RECOVER 상태면 → IDLE 유지, 공격 없음

---

### B14. 보스 스테이지 페이즈 구조

**해당 스테이지:** s6 BREAKOUT (WALL GUARDIAN), s8 THE APEX (MARKET ITSELF)  
**구분 기준:** 단순 적군보다 HP 3배 이상, 페이즈별 행동 패턴 변경.

**s6 보스: WALL GUARDIAN**
```
총 HP: 300 (일반 적 100 대비 3배)
Phase 1 (HP 100%~60%): 저항선 앞 고정 수비
  - 매 CLASH마다 EXECUTOR 공격을 70% 확률로 막음 (OBJ 증가량 -50%)
  - 배너: "WALL HOLDS — 저항선이 버티고 있다"

Phase 2 (HP 60%~30%): 반격 강화
  - 반격 데미지 +50%, 반격 빈도 1800ms → 1200ms
  - MAW 패턴 추가: 낮은 HP 아군 추적 시작
  - 배너: "WALL CRACKS — 저항이 흔들리고 있다"

Phase 3 (HP 30%~0): 브레이크아웃 게이트 개방
  - 방어 포기, 공격 전환
  - EXECUTOR BREAKOUT 스킬 사용 시 데미지 2배
  - 매 CLASH마다 OBJ +15 (Phase 1의 1.5배)
  - 배너: "BREAKOUT — 돌파구가 열렸다!"
```

**s8 보스: MARKET ITSELF (최종 보스)**
```
총 HP: 500
Phase 1 (HP 100%~70%): 강세장 모드
  - 아군에게 유리한 지형 생성 (support +2개)
  - 하지만 EXECUTOR hesitate 확률 +20% (자만심 함정)
  - 배너: "시장이 웃고 있다 — 조심하라"

Phase 2 (HP 70%~40%): 역전
  - 모든 지지선 제거, 청산존 3개 동시 생성
  - 매 RESOLVE마다 아군 전체 conf -0.05
  - VETO 카드 효과 무효화
  - 배너: "시장이 뒤집혔다"

Phase 3 (HP 40%~0%): 카오스 모드
  - 매 라운드마다 독트린 효과 랜덤화 (hesitate ±0.20 랜덤 변동)
  - OBJ 80% 이상이면 보스가 OBJ -20% 반격
  - 배너: "이건 시장이 아니다 — 이건 Cogochi다"
```

**페이즈 전환 처리:**
```ts
function checkBossPhase(bossHp: number, maxHp: number) {
  const ratio = bossHp / maxHp
  if (ratio <= 0.30 && currentPhase < 3) { enterPhase3(); return }
  if (ratio <= 0.60 && currentPhase < 2) { enterPhase2(); return }
}
// 페이즈 전환 시: hitStop 120프레임 + 화면 플래시 + 페이즈 배너 3초
```

---

### B15. UI 피드백 우선순위 시스템

**목적:** 화면에 동시에 너무 많은 정보가 표시되면 플레이어가 읽기를 포기한다.  
우선순위를 강제해서 "지금 뭘 봐야 하는지"를 항상 명확하게 유지.

**피드백 우선순위 (높을수록 먼저):**
```
P1 (즉시, 250ms 이내):
  - 스킬 선택 결과 (데미지 숫자, OBJ 변화)
  - 피격 (flash + 데미지 숫자)
  - Hesitate 발생 (⚠ 아이콘 + 배너)

P2 (빠름, 500ms 이내):
  - Phase 전환 (Phase 배너 + 색상 변경)
  - HP 바 변화
  - 스킬 팝업 이름

P3 (보통, 1~2초):
  - OBJ 바 변화 (transition: width .7s)
  - 라운드 종료 요약 배너
  - 메시지창 타이프라이터

P4 (느림, 2초 이상):
  - Reflection 카드 표시 (배틀 종료 후 0.9s 딜레이)
  - 스테이지 해금 애니메이션
```

**화면 복잡도 관리 — 동시 표시 최대값:**
```
플로팅 텍스트: 최대 3개 (3개 초과 시 가장 오래된 것 제거)
파티클:        최대 80개 (초과 시 oldest-first 제거)
배너:          1개만 (새 배너가 오면 이전 배너 즉시 대체)
메시지 큐:     무제한 (순차 표시)
```

**플레이어가 반드시 항상 알 수 있어야 하는 정보 (항상 HUD에 노출):**
```
① 현재 Phase (색상 포함)
② 현재 라운드 / 전체 라운드 (예: ROUND 3/8)
③ OBJ % (바 + 숫자)
④ EXECUTOR HP
⑤ 사용 가능한 카드 (쿨다운 중인 것 dimmed)
```

**선택적 표시 (중요하지만 항상 노출 불필요):**
```
⑥ EXECUTOR confidence (오라 강도로 시각화 → 숫자 필요 없음)
⑦ 적군 HP (포켓몬 우측 HP 바)
⑧ 스킬 PP 잔여 (스킬 메뉴 열릴 때만)
```

**피드백 없으면 버그로 간주하는 케이스:**
```
- 스킬 선택 후 0.5s 안에 시각 변화 없음 → 버그
- Hesitate 발생 후 배너 없음 → 버그  
- Phase 전환 후 Phase 표시 색상 안 바뀜 → 버그
- OBJ 변화 후 1s 안에 바 업데이트 없음 → 버그
```

---

### B16. 리스크-보상 구조 설계

**목적:** 매 순간 "더 공격적으로 갈까, 안전하게 갈까"의 선택이 의미 있어야 한다.

**핵심 리스크-보상 쌍:**

| 리스크 행동 | 예상 보상 | 예상 위험 |
|---|---|---|
| AGGRESSIVE 독트린 선택 | OBJ +9/hit, hesitate 8% | 고변동성 스테이지에서 conf 폭락 |
| BREAKOUT 스킬 사용 (PP 10) | OBJ +12 즉시 | PP 소진 → 후반 스킬 부재 |
| FOCUS 카드 사용 (쿨 8s) | conf +0.20 → CLASH 데미지 최대화 | 쿨다운 중 다른 카드 사용 불가 |
| VETO 아끼기 | 나중에 더 중요한 상황에 사용 | 지금 큰 피해 허용 |
| 스킬 메뉴에서 SHORT TRAP 선택 | crusher.conf -0.20 → 반격 약화 | 직접 OBJ 증가 없음 (간접 효과만) |

**보상 타이밍 구조 (Reward Timing):**
```
즉각 보상 (0~1초):
  - OBJ 수치 변화
  - 데미지 숫자 팝업
  - 스킬 이름 팝업

중간 보상 (라운드 단위, 30~40초):
  - 라운드 히스토리 바 색상 변화 (초록=우세, 빨강=열세)
  - HP 바 누적 변화

장기 보상 (배틀 종료, 4~6분):
  - VICTORY/DEFEAT
  - XP 획득
  - 스테이지 해금
  - Reflection에서 성장 확인
```

**밸런스 붕괴 구간 (설계상 알려진 문제):**
```
위험 구간 1: Round 1~2 — OBJ 격차가 벌어지면 역전 거의 불가
  → 대응: Round 1에 RETARGET 카드 사용 금지 권고 (UX 힌트)
     실제 패널티는 없음 — 플레이어 판단에 맡김

위험 구간 2: EXECUTOR conf 0.9 이상
  → BREAKOUT + FOCUS 콤보로 OBJ 25+ 폭증 가능
  → 의도된 "snowball 순간". 그 직전 카드 사용이 핵심 기술

위험 구간 3: 스킬 PP 전부 소진 후 Round 6~8
  → 카드만으로 싸워야 함 — 실력 차이 구간
  → Defensive 독트린이 이 구간에서 역전 가능 (hesitate 높지만 HP 유지)
```

---

### B17. 실패 후 재도전 동기 설계

**목적:** 패배가 "게임을 닫고 싶다"가 아니라 "바로 다시 하고 싶다"로 연결되어야 한다.

**재도전 동기를 만드는 메커니즘 4개:**

**① 즉각적 귀인 (Attribution) — Reflection이 핵심**
```
나쁜 패배: "왜 졌는지 모르겠다"
좋은 패배: "hesitate 4번 → AGGRESSIVE 독트린으로 바꾸면 될 것 같다"

구현: Reflection 카드에서 변경해야 할 항목을 1개만 제시
     복수 제안 금지 (혼란 → 미루기)
```

**② 손실 근접성 (Near Miss) 메시지**
```
조건: OBJ 40~49% 패배 시
메시지: "OBJ 49%. 거의 다 왔다. SCAN WIDE 한 번만 더 있었으면..."

조건: Hesitate 1회 패배 시
메시지: "EXECUTOR가 딱 1번 망설였다. 그 1번이 결과를 바꿨다."
→ 이 조건들은 classifyFailure()에 케이스 추가 필요
```

**③ 진행 유지 (Progress Preservation)**
```
패배 시에도 지급되는 것:
- XP +15 (최소 보장)
- Battle count +1 (누적 통계)
- 사용한 스킬 PP 기록 → 다음 배틀 전략 힌트

패배 시 잃는 것:
- 스테이지 클리어 상태 (재도전 필요)
- 이번 배틀에서 쌓은 임시 OBJ

→ 설계 원칙: "잃는 것"이 "얻은 것"보다 적게 느껴져야 함
```

**④ 재도전 마찰 제거**
```
Reflection 화면에서 RETRY 버튼:
  - 독트린 선택 화면 → 배틀 (2단계)
  - 버튼 누르면 같은 독트린으로 즉시 재배틀 가능 (0단계)

CHANGE DOCTRINE:
  - 독트린 선택 화면만 거침 (1단계)

WORLD MAP:
  - 맵으로 복귀, 다른 스테이지 선택 가능

→ 패배 후 3초 안에 재배틀 진입 가능해야 함 (목표)
```

---

### B18. 플레이 루프 전체 흐름 (시간축)

**목적:** 가이드가 요구하는 "짧은 주기 판단 / 중간 보상 / 장기 성장" 3개를 명시.

**Short Loop (Phase 단위, 11.4초):**
```
SCAN → RECALL → PLAN → CAST → CLASH → RESOLVE
                              ↑
                        플레이어 판단 포인트:
                        "카드 지금 쓸까? 스킬 선택할까?"
중간 피드백: OBJ 변화, 피격 플래시, 데미지 숫자
```

**Mid Loop (Round 단위, 68초):**
```
Round 1~8 반복
라운드 종료마다: 히스토리 바 추가, HP 정산
Round 4: "중간점검" 지점 — OBJ 40% 미만이면 전략 변경 신호
Round 6~8: 스킬 PP 소진 구간 → 카드에 의존
피드백: 라운드 히스토리 바 색상 패턴
```

**Long Loop (배틀 단위, 4~6분):**
```
배틀 종료 → Reflection 카드 → 스테이지 클리어/실패
→ XP 획득 → 레벨업 체크 → 다음 스테이지 해금 확인
→ 월드맵 복귀 → 독트린 조정 결정
피드백: VICTORY/DEFEAT 연출, XP 게이지 애니메이션
```

**Meta Loop (세션 단위, 15~20분):**
```
스테이지 1~3 클리어 (Zone 1 완료)
→ Zone 2 진입 — 새로운 지형 오브젝트 등장
→ 에이전트 레벨업 → 새 스킬 해금 발견
피드백: Zone 클리어 배너, 레벨업 팝업
```

---

*추가됨: 2026-03-08 — 가이드 기준 누락 섹션 5개 (B12~B18)*

---

# [문서 기준 추가 섹션] — 4개 완전 누락 항목

---

### E1. 승리 / 패배 조건 (명시적 전체 정의)

**목적:** 모델이 "배틀이 언제 끝나는지"를 코드로 번역할 수 있게 명확히 정의.

**배틀 단위 승리 조건:**
```ts
// 조건 체크 순서 — 매 RESOLVE Phase 종료 시
function checkBattleEnd(bs: BattleState): 'VICTORY' | 'DEFEAT' | 'CONTINUE' {
  if (bs.executor.hp <= 0)            return 'DEFEAT'   // 즉시 — 라운드 중에도
  if (bs.obj >= 100)                  return 'VICTORY'  // 즉시
  if (bs.round >= 8 && bs.obj >= 50)  return 'VICTORY'  // 8라운드 버텼고 과반
  if (bs.round >= 8 && bs.obj < 50)   return 'DEFEAT'   // 8라운드 소진
  return 'CONTINUE'
}
```

**승리 등급 (VICTORY 세분화):**
| 조건 | 등급 | 추가 XP |
|---|---|---|
| OBJ >= 100 (조기 클리어) | S | +100 |
| Round 1~5 내 OBJ 100 | S+ | +150 |
| OBJ 80~99 (8라운드 완주) | A | +60 |
| OBJ 50~79 (간신히) | B | +30 |
| Hesitate 0회 + 승리 | 추가 | +30 |
| 카드 3개 이상 사용 + 승리 | 추가 | +20 |

**패배 등급 (DEFEAT 세분화 — Reflection 분기에 사용):**
| 조건 | 분류 | Reflection 힌트 |
|---|---|---|
| executor.hp <= 0 | HP_DEATH | "EXECUTOR 보호가 필요함 — VETO 카드 사용 타이밍 확인" |
| Hesitate >= 4회 | HESITATE_OVER | "Doctrine 불일치 — AGGRESSIVE 교체 권고" |
| OBJ 40~49% | NEAR_MISS | "카드 1회 더 있었으면 됐음 — 아낀 카드 더 빨리 사용" |
| OBJ < 30% | OBJECTIVE_FAIL | "Round 1~2 공세 부족 — FOCUS+RETARGET 초반 사용" |
| Round 8 + OBJ 30~49% | TIME_OUT | "SCAN WIDE + MOMENTUM 콤보로 초반 가속 필요" |

**스테이지 단위 승리 조건:**
```
스테이지 클리어: 배틀 VICTORY 1회
→ stage.state = 'CLEARED'
→ localStorage 저장
→ 다음 스테이지 UNLOCKED
→ XP + stage.reward
```

**스테이지 단위 패배 조건:**
```
스테이지 클리어 없음 = 패배
→ stage.state 변경 없음 (UNLOCKED 유지)
→ 재도전 가능 (횟수 제한 없음)
→ XP +15 (최소 보장)
```

**게임 전체 클리어 조건:**
```
s8 THE APEX 클리어 → 시즌 엔딩 화면
→ "Season 1 Complete" 배너
→ 전체 통계 표시 (총 배틀 횟수, 총 XP, 평균 OBJ)
→ 로컬 저장 후 New Game + (난이도 선택) 제안
```

---

### E2. 아트 / 사운드 수준 명세 (Art Level Spec)

**목적:** "픽셀 도형"이 얼마나 세밀해야 하는지 모델이 코드로 그릴 수 있게 치수까지 정의.

**아트 수준 선언:**
```
MVP 아트 방침:
- 실제 픽셀아트 스프라이트 파일 없음
- 전부 Canvas2D 도형 합성으로 표현
- 하지만 "도형 조합"이 아니라 "식별 가능한 캐릭터 실루엣" 수준 목표
- 기준: 화면에 8명이 동시에 있어도 역할별 외형이 1초 안에 구분 가능
```

**에이전트 스프라이트 치수 (공통):**
```
바운딩 박스: 20px × 28px
몸통: rect(x-5, y-20, 10, 14) — 역할별 색상
머리: circle(x, y-24, 5) — 역할별 색상
다리 (idle): 두 rect 각 3×6px
그림자: ellipse(x, ground+2, 8, 3, 0.3 알파)
```

**역할별 시각 식별 요소 (추가 도형 — 반드시 그려야 함):**
| 에이전트 | 추가 요소 | 치수 | 색상 |
|---|---|---|---|
| SCOUT/Kira | 머리 위 안테나 선 | 3px 세로 | #00e5ff |
| ANALYST/Nova | 눈 위치에 가로선 (안경) | 8px 가로 | #ffffff |
| RISK/Aegis | 앞에 작은 방패 rect | 5×8px | #00ff88 |
| EXECUTOR/Apex | 손에 세로 선 (검) | 2×12px | #ffaa00 |
| CRUSHER/Dread | 머리 위 가로 막대 (망치) | 8×3px | #ff2040 |
| TRAPPER/Lure | 몸 주변 작은 원 3개 | r=2px | #ff6b35 |
| MAW/Void | 몸통 위에 큰 반원 (입) | r=7px | #ff00aa |
| BREAKER/Spike | 몸 외곽에 삼각형 4개 | 4px | #cc1f42 |

**애니메이션 프레임 정의 (Canvas2D, 타이머 기반):**
```
idle:     sin(t * 0.03) * 1.5 → Y 오프셋 (숨쉬기 효과)
walk:     sin(t * 0.15) * 3   → 다리 Y 교대 (좌우 번갈아)
run:      sin(t * 0.25) * 5   → 다리 Y 교대 + 몸 앞기울기 1px
attack:   flash 4프레임 → 검/망치 요소 8px 앞으로
hit:      flash white overlay 8프레임 (globalAlpha 0.8)
dead:     몸통 rotate(Math.PI/2) → 옆으로 쓰러짐
hes:      sin(t * 0.04) * 1.5 → X 흔들림 (망설임 떨림)
```

**conf 오라 시각화:**
```
conf >= 0.8:
  ctx.shadowBlur = 12
  ctx.shadowColor = agentColor
  → 글로우 링 1개 (r=14, alpha=0.4)

conf >= 0.95 (전투 준비 완료):
  글로우 링 2개 (r=14, r=20)
  파티클 3개/frame 자동 방출

conf <= 0.2 (위험):
  몸통 색상에 desaturate 효과 (globalAlpha 0.6)
  머리 위 ⚠ 텍스트 (font: 10px, color: #ff4444)
```

**UI 도형 치수:**
```
HP 바 (좌우):
  위치: 좌상단 (24, 16) / 우상단 (W-224, 16)
  크기: 200 × 20px
  테두리: 2px white
  내부: 아군 #4caf50 / 적군 #f44336
  50% 이하: 색상 → #ffc107
  20% 이하: 색상 → #f44336 + 깜빡임 (0.5s 주기)

OBJ 바:
  위치: 상단 중앙 (W/2 - 100, 12)
  크기: 200 × 16px
  색상 그라데이션: #1a237e → #7c4dff (0~49%), #7c4dff → #ffd600 (50~100%)

Phase 인디케이터:
  위치: 우상단 (W-16, 16)
  크기: 12 × 12px 원
  Phase별 색상:
    SCAN #00e5ff / RECALL #9966ff / PLAN #aaaaaa
    CAST #ff9800 / CLASH #f44336 / RESOLVE #4caf50
```

**사운드 비주얼 수준:**
```
모든 사운드: Web Audio API 직접 합성 (파일 없음)
배경음악: 없음 (MVP)
효과음만: 8가지 (C3 오디오 사양 참조)
사운드 실패 시 (autoplay 정책): 무음으로 fallback, 게임 진행은 정상
```

---

### E3. 모델 산출물 강제 명령 (Output Protocol)

**목적:** 모델이 바로 코딩으로 뛰어들지 않고 설계 검토 → 계획 → 구현 순서를 따르게 강제.  
**이 섹션은 새 Claude/Codex 세션 시작 시 DOCUMENT A~D 앞에 붙인다.**

**[세션 시작 시 붙이는 텍스트]:**
```
너는 지금 Cogochi 게임의 [SPRINT N] 구현을 담당한다.

절대 원칙:
1. 이번 스프린트 범위 외의 코드를 작성하지 말 것
2. 코드 작성 전에 반드시 아래 단계를 순서대로 진행할 것
3. 각 단계의 출력이 완료된 후 다음 단계로 넘어갈 것
4. 추상적 표현, 형용사, "나중에" 금지 — 규칙/수치/조건으로만 표현

응답 순서 (이 순서를 지키지 않으면 처음부터 다시):

STEP 1 — 설계 검토 (코딩 없음)
  - 이번 스프린트 범위에서 모호한 부분 목록
  - 충돌하는 규칙이 있으면 명시 + 해결안 제시
  - 빠진 데이터 구조가 있으면 직접 제안
  - 완료 조건 재확인

STEP 2 — 파일 목록 + 역할 (코딩 없음)
  - 생성할 파일 목록 (경로 포함)
  - 각 파일의 책임 (1~2줄)
  - 작성 순서와 이유

STEP 3 — 파일별 구현 (1파일씩)
  - 파일명 + 역할 설명
  - 코드
  - 이 파일이 의존하는 파일
  - 테스트 방법 (브라우저에서 확인할 수 있는 것)

STEP 4 — 스프린트 완료 체크
  - 완료 조건 체크리스트 (각 항목 ✅/❌)
  - 다음 스프린트 진입 전 확인 사항
```

**[스프린트별 완료 조건 — 모델이 ✅/❌로 체크해야 함]:**

Sprint 1 (HTML 프로토타입):
```
[ ] 브라우저에서 파일 열면 배틀 화면 진입
[ ] 8라운드 자동 진행 완료
[ ] Hesitate 발생 시 배너 표시
[ ] VICTORY/DEFEAT 판정 후 Reflection 화면 전환
[ ] 카드 키(F/M/V/R/D) 입력 시 즉각 반응
[ ] arc() 에러 콘솔 없음
```

Sprint 2 (SvelteKit 이식):
```
[ ] npm run dev 후 /battle 라우트 접근 가능
[ ] battleStore의 Phase 루프가 동일하게 작동
[ ] SkillMenu 컴포넌트 클릭 시 스킬 발동
[ ] HP 바 실시간 업데이트
[ ] Reflection 카드 표시 후 RETRY 클릭 시 재배틀
[ ] TypeScript 에러 0개
```

Sprint 3 (에이전트 시스템):
```
[ ] rosterStore에서 에이전트 생성 가능
[ ] 배틀 후 XP 지급 및 레벨업 체크
[ ] AgentCard 컴포넌트에서 XP 바 표시
[ ] 스테이지 클리어 → localStorage 저장 → 새로고침 후 유지
[ ] Bond 값이 배틀 마다 변화하고 표시됨
```

Sprint 4 (Ollama 연결):
```
[ ] Ollama 미설치 시 규칙 기반 fallback 자동 작동
[ ] Ollama 설치 시 CAST Phase에서 실제 추론 사용
[ ] 추론 timeout 2000ms 초과 시 fallback으로 전환
[ ] Reflection에 AI reasoning 텍스트 표시
[ ] 배틀 1판 총 소요시간 6분 이내
```

---

### E4. Claude vs Codex 역할 분리

**목적:** Claude와 Codex를 같이 쓸 때 각자 강점에 맞게 역할을 배분.

**Claude 담당 (설계 파트너):**
```
✅ 설계 문서 검토 및 모순 찾기
✅ 빠진 시스템 보완 제안
✅ 시스템 간 충돌 규칙 해결
✅ 새 스테이지/스킬/보스 설계
✅ Reflection 분류 로직 설계
✅ Balance 수치 검토 ("이 hesitate 0.5가 맞냐?")
✅ 코드 리뷰 (구조적 문제, 확장성)
```

**Codex 담당 (구현 담당):**
```
✅ types.ts, config.ts 생성
✅ 스토어 파일 구현 (battleStore, rosterStore)
✅ 컴포넌트 구현 (BattleCanvas, SkillMenu)
✅ 리팩터링 (HTML 프로토타입 → SvelteKit)
✅ 버그 수정 (arc() 에러, timer 누수)
✅ 테스트 파일 작성
```

**세션 핸드오프 포맷 (Claude → Codex):**
```
[Claude가 설계 완료 후 Codex에 넘길 때 쓰는 형식]

## Codex 인수 사항

구현 대상: [파일명]
역할: [1줄]
의존: [이 파일이 import하는 것]
입력: [파라미터 또는 상태]
출력: [반환값 또는 사이드이펙트]
완료 조건: [테스트 방법]
금지: [하지 말아야 할 것]
참조 섹션: [이 문서의 어느 섹션 기준으로 구현하는지]
```

**세션 핸드오프 포맷 (Codex → Claude):**
```
[Codex가 구현 완료 후 Claude에 리뷰 요청할 때]

## 리뷰 요청

구현 완료: [파일명]
완료 조건 체크: [✅/❌ 목록]
불확실한 부분: [모델이 임의 결정한 것 목록]
다음 파일: [다음에 구현해야 할 것]
질문: [설계 문서에서 불명확한 것]
```

---

*추가됨: 2026-03-08 — 문서 기준 4개 완전 누락 항목 (E1~E4)*
