# Cogochi 문서 감사 + 구현 지시 프롬프트 보완 최종 리스트

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-03-08 | 전체 20개 파일 감사 + 프롬프트 누락 항목 최종 정리 |

---

## PART 1. 원본 문서 전체 감사

### 1-1. 분류 기준

```
[A] 프로젝트 지식에 상시 유지 — 세션마다 없으면 방향이 흔들리는 것
[B] 스프린트 진입 시 첨부 — 그 시점에만 필요한 것
[C] 보관만 / 참조용 — 설계 근거·이력이지만 실행 지시에 직접 영향 없음
[X] 불필요 — 중복·로그·외부 도구 설정
```

---

### 1-2. 파일별 판정

| 파일 | 라인 | 판정 | 이유 |
|---|---|---|---|
| `MASTER_GAME_SPEC.md` | 931 | **[A]** | 전체 설계의 진실 소스. 충돌 시 이 문서가 이김. 항상 있어야 함 |
| `AGENT_SYSTEM_DESIGN.md` | 1014 | **[A]** | 도메인 모델 전체 정의. OwnedAgent/MemoryBank/TrainingRun 구조. 코드 작성 시 기준 |
| `TECH_ARCHITECTURE.md` | 207 | **[A]** | SvelteKit 2/Svelte 5 스택 확정, 폴더 구조, 스토어 분리 기준. 짧고 핵심만 있음 |
| `Cogochi_Dev_Prompt_20260308.md` | 1475 | **[A]** | 수치·상태·스킬·보스·조작 전부. 이게 없으면 모델이 임의 단순화함 |
| `AI_IMPLEMENTATION_CONTRACTS.md` | 1258 | **[B]** Sprint 3~4 | Ollama/반성/메모리 writeback TypeScript 인터페이스 정의. Sprint 3 전까지는 불필요 |
| `AI_RUNTIME_TRAINING_SPEC.md` | 912 | **[B]** Sprint 4 | RAG 구조, 파인튜닝 루프. Sprint 4(Ollama 연결) 시점에만 필요 |
| `BATTLE_RUNTIME_PRESENTATION_SPEC.md` | 656 | **[B]** Sprint 2 | 배틀 하이브리드 런타임(AI 의도→게임 액션→렌더링) 분리 계약. BattleCanvas 구현 시 필요 |
| `CHART_BATTLE_SPEC.md` | 532 | **[B]** Sprint 2 | 차트→지형 변환 문법, 레이어 스택. BattleCanvas 구현 시 필요 |
| `UIUX_SYSTEM.md` | 176 | **[B]** Sprint 2 | 6개 라우트 책임, 색상·타이포·모바일 규칙. UI 컴포넌트 작업 시 첨부 |
| `PROGRESSION_MODEL.md` | 153 | **[B]** Sprint 3 | 진행 철학, XP/Bond/Specialization/MemoryQuality. rosterStore 구현 시 필요 |
| `GAME_DESIGN.md` | 176 | **[C]** | MASTER_GAME_SPEC의 요약본. 내용 겹침. 독립 가치 낮음 |
| `PRODUCT_BLUEPRINT.md` | 177 | **[C]** | AGENT_SYSTEM_DESIGN의 상위 요약. 내용 겹침. 읽기용으로만 유용 |
| `PROJECT_CONTEXT.md` | ~150 | **[C]** | 현재 구현 상태 스냅샷(2026-03-06). 빠르게 낡음. 이력 참고용 |
| `CONTEXT_ENGINEERING.md` | 210 | **[C]** | 코덱스/클로드 운영 원칙. 좋은 내용이지만 실행 지시 문서에 이미 반영됨 |
| `RELIABILITY.md` | 177 | **[C]** | 벤치마크 노이즈 제어, 프로모션 규칙. Sprint 4 이후 파인튜닝 루프 안정화 시점에 유효 |
| `QUALITY_SCORE.md` | ~100 | **[C]** | 레포 상태 스코어카드. 운영 메타 문서. 개발 실행에 직접 영향 없음 |
| `PLANS.md` | ~80 | **[C]** | exec-plan 저장 규칙. 프로세스 문서. 코드 작성에 직접 영향 없음 |
| `INDEX.md` | ~60 | **[C]** | 문서 네비게이션 지도. 로컬 레포용. Claude 세션에서는 불필요 |
| `README.md` | ~20 | **[X]** | "이 폴더는 실제 문서입니다" 한 줄 설명. 내용 없음 |
| `AGENT_WATCH_LOG.md` | 396 | **[X]** | 작업 이력 로그. 설계 근거 아님. Claude 세션 컨텍스트 낭비 |
| `SKILL.md` | 193 | **[X]** | pm-analytics 스킬 파일. Cogochi 설계와 무관. 잘못 업로드된 것으로 보임 |

---

### 1-3. 프로젝트 지식 구성 최종 권고

**항상 켜둘 것 [A] — 3개:**
```
1. MASTER_GAME_SPEC.md          (931줄) — 설계 기준점
2. AGENT_SYSTEM_DESIGN.md      (1014줄) — 도메인 모델
3. TECH_ARCHITECTURE.md         (207줄) — 스택 확정
4. Cogochi_Dev_Prompt_20260308.md (1475줄) — 수치·시스템·지시
```
합계: ~3600줄. Claude 프로젝트 지식 용량 내 유지 가능.

**스프린트 진입 시 그 세션에만 첨부할 것 [B]:**
```
Sprint 2 진입 시: BATTLE_RUNTIME_PRESENTATION_SPEC.md + CHART_BATTLE_SPEC.md + UIUX_SYSTEM.md
Sprint 3 진입 시: PROGRESSION_MODEL.md + AI_IMPLEMENTATION_CONTRACTS.md (일부)
Sprint 4 진입 시: AI_RUNTIME_TRAINING_SPEC.md + AI_IMPLEMENTATION_CONTRACTS.md (전체)
```

**삭제하거나 무시할 것 [X] — 3개:**
```
README.md        — 내용 없음
AGENT_WATCH_LOG.md — 이력 로그, 설계 근거 아님
SKILL.md         — 다른 프로젝트 파일, Cogochi 무관
```

---

## PART 2. 구현 지시 프롬프트 현재 상태

`Cogochi_Dev_Prompt_20260308.md` 현재 포함 항목:

| 섹션 | 상태 |
|---|---|
| 게임 비전·판타지·Anti-Fantasy | ✅ |
| 에이전트 Identity 시스템 | ✅ |
| Doctrine 수치 확정값 | ✅ |
| Battle Phase 엔진 (6-phase 타이밍·분기) | ✅ |
| 스킬 시스템 PP·4종 세트 | ✅ |
| Chart Terrain pY/groundAtX 방어코드 | ✅ |
| 에이전트 렌더링 물리 | ✅ |
| 파티클 시스템 | ✅ |
| Stage Map 8개 테이블 | ✅ |
| Reflection 분류 로직 | ✅ |
| Progression XP 이벤트·레벨 해금 | ✅ |
| Ollama fallback 계약 | ✅ |
| 배틀 레이어 구조 (z-index) | ✅ |
| 오디오 사양 (주파수·파형) | ✅ |
| 폴더·모듈 구조 | ✅ |
| 코딩 규칙 | ✅ |
| MVP 포함/제외 | ✅ |
| 스프린트 완료 조건 | ✅ |
| 조작 방식 상세 (B12) | ✅ |
| 적군 AI 상태머신 (B13) | ✅ |
| 보스 페이즈 구조 (B14) | ✅ |
| UI 피드백 우선순위 (B15) | ✅ |
| 리스크-보상 구조 (B16) | ✅ |
| 실패 후 재도전 동기 (B17) | ✅ |
| 플레이 루프 시간축 (B18) | ✅ |
| 승리/패배 조건 전체 (E1) | ✅ |
| 아트 수준 명세 치수 (E2) | ✅ |
| 산출물 강제 명령 (E3) | ✅ |
| Claude vs Codex 역할 분리 (E4) | ✅ |

---

## PART 3. 구현 지시 프롬프트 여전히 부족한 것

원본 문서와 교차 확인 후 **아직 프롬프트에 없는 항목 8개:**

---

### 추가 필요 항목 1: 스쿼드 시너지 규칙

**원본 출처:** MASTER_GAME_SPEC.md §7 Two-Layer Role System  
**현재 상태:** 역할 정의는 있지만, 4명 조합이 수치에 어떻게 영향 주는지 없음.  
**추가할 내용:**
```ts
// 스쿼드 시너지 보너스 (배틀 시작 시 1회 계산)
const synergyBonus = {
  SCOUT_EXECUTOR: {
    condition: squad.includes('SCOUT') && squad.includes('EXECUTOR'),
    effect: 'executor.hesitateChance -= 0.08',
    label: 'RECON SYNC — EXECUTOR 망설임 -8%'
  },
  ANALYST_RISK: {
    condition: squad.includes('ANALYST') && squad.includes('RISK'),
    effect: 'allAgents.conf += 0.05',
    label: 'RISK FRAMEWORK — 전체 conf +5%'
  },
  FULL_SQUAD: {
    condition: squad.length === 4, // 4역할 전부 다름
    effect: 'OBJ starting += 5',
    label: 'FULL FORMATION — 시작 OBJ +5'
  }
}
```

---

### 추가 필요 항목 2: 메모리 Bank가 배틀에 미치는 영향

**원본 출처:** AGENT_SYSTEM_DESIGN.md §MemoryBank, AI_RUNTIME_TRAINING_SPEC.md §4.2  
**현재 상태:** "메모리 50개 최대" 언급만 있음. 배틀 수치에 어떻게 연결되는지 없음.  
**추가할 내용:**
```ts
// 메모리 품질이 배틀에 영향 주는 방식 (MVP 규칙 기반 버전)
function applyMemoryBonus(agent: AgentInstance, bs: BattleState) {
  const mem = agent.memoryBank
  // 승리 케이스 비율이 높으면 conf 보정
  const winRatio = mem.filter(m => m.outcome === 'WIN').length / Math.max(mem.length, 1)
  agent.conf = Math.min(1, agent.conf + winRatio * 0.1)

  // 같은 Doctrine으로 이긴 기록이 있으면 hesitate 감소
  const docMatch = mem.filter(m => m.doctrine === agent.doctrine && m.outcome === 'WIN')
  if (docMatch.length >= 2) agent.hesitateBonus = -0.05

  // RECALL Phase에서 메모리 펄스 강도 결정
  bs.recallIntensity = Math.min(1, mem.length / 20) // 20개 이상이면 full intensity
}
```

---

### 추가 필요 항목 3: 에이전트 생성 플로우

**원본 출처:** AGENT_SYSTEM_DESIGN.md §OwnedAgent, PRODUCT_BLUEPRINT.md  
**현재 상태:** AgentInstance 타입은 있지만, "처음에 어떻게 만드는가"의 UI 플로우가 없음.  
**추가할 내용:**
```
에이전트 생성 플로우 (Sprint 3):
1. /roster → "새 에이전트 만들기" 버튼
2. 이름 입력 (미입력 시 AGENT_xxxx 자동)
3. BaseModel 선택 (MVP: Qwen3-1.7B 1종만)
4. FunctionalRole 선택 (SCOUT/ANALYST/RISK/EXECUTOR)
5. ExpressionRole 자동 매핑 or 수동 선택
6. Doctrine 선택 (AGGRESSIVE 기본)
7. 생성 완료 → rosterStore에 추가 → /agent/[id]로 이동

생성 제한:
- 최대 12명 (MVP)
- 동일 이름 금지
- 스쿼드 슬롯: 4명. 12명 중 4명 선택

초기값:
  level: 1, xp: 0, bond: 10, conf: 0.5, hp: 100
  memoryBank: [] (빈 상태)
  hesitateBonus: 0
```

---

### 추가 필요 항목 4: TrainingLoadout → 배틀 수치 변환 규칙

**원본 출처:** AGENT_SYSTEM_DESIGN.md §TrainingLoadout  
**현재 상태:** Doctrine만 수치로 정의됨. Prompt/DataBinding/RetrievalPolicy가 배틀에 어떤 영향 주는지 없음.  
**추가할 내용:**
```ts
// MVP에서는 간소화된 LoadoutBonus 적용
interface LoadoutBonus {
  confMod: number        // 기본 conf 보정
  hesiteMod: number      // hesitate 보정
  recallDepth: number    // RECALL phase 메모리 참조 수 (1~5)
  objMod: number         // CLASH 시 OBJ 증가 보정
}

// DataBinding 선택별 보정 (MVP 3종)
const dataBindings = {
  PRICE_ONLY:   { confMod: 0,    recallDepth: 1, label: '가격만' },
  PRICE_VOL:    { confMod: 0.05, recallDepth: 2, label: '가격+변동성' },
  FULL_CONTEXT: { confMod: 0.10, recallDepth: 3, label: '전체 컨텍스트', requiresLv: 5 }
}

// RetrievalPolicy 선택별 보정 (MVP 3종)
const retrievalPolicies = {
  RECENT:     { hesiteMod: -0.03, recallDepth: 1 },
  RELEVANT:   { hesiteMod: -0.05, recallDepth: 2 },
  DEEP:       { hesiteMod: -0.08, recallDepth: 4, requiresLv: 7 }
}
```

---

### 추가 필요 항목 5: /lab 화면 MVP 범위

**원본 출처:** UIUX_SYSTEM.md §/lab, TECH_ARCHITECTURE.md §labStore  
**현재 상태:** 폴더 구조에 lab/+page.svelte는 있지만 MVP에서 뭘 보여줄지 없음.  
**추가할 내용:**
```
/lab MVP 범위 (Sprint 3):
보여줄 것:
  - DataBinding 선택 UI (에이전트별)
  - RetrievalPolicy 선택 UI (에이전트별)
  - 메모리 카드 목록 (최근 5개)
  - 메모리 삭제 버튼

보여주지 않을 것 (Post-MVP):
  - 실제 파인튜닝 실행 버튼 (mlx-lm 연결 전)
  - 벤치마크 비교
  - 프롬프트 에디터 전체

/lab의 MVP 역할:
"이 에이전트에게 어떤 데이터를 줄지, 어떻게 기억을 검색할지 설정하는 화면"
배틀 전 /team과 함께 준비 루프의 핵심
```

---

### 추가 필요 항목 6: 배틀 결과 → 메모리 writeback 플로우

**원본 출처:** AGENT_SYSTEM_DESIGN.md §MemoryBank, PROGRESSION_MODEL.md §7 Reflection Loop  
**현재 상태:** Reflection 카드 표시는 있지만, "그 다음에 무엇이 저장되는가"가 없음.  
**추가할 내용:**
```ts
// 배틀 종료 후 자동 실행
function writebackMemory(agent: AgentInstance, bs: BattleState, note: ReflectionNote) {
  const card: MemoryRecord = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    doctrine: agent.doctrine,
    outcome: bs.obj >= 50 ? 'WIN' : 'LOSS',
    objFinal: bs.obj,
    hesitateCount: bs.hes,
    cardsUsed: bs.cardsUsed,
    lesson: note.lesson,          // Reflection에서 생성된 1줄
    stageId: bs.currentStage
  }

  agent.memoryBank.push(card)

  // 50개 초과 시 bond 낮은 순 제거
  if (agent.memoryBank.length > 50) {
    agent.memoryBank.sort((a, b) => a.bondAtTime - b.bondAtTime)
    agent.memoryBank.shift()
  }

  // rosterStore 업데이트
  rosterStore.updateAgent(agent.id, { memoryBank: agent.memoryBank })
}
```

---

### 추가 필요 항목 7: 시나리오 패킷 구조 (배틀 시작 데이터)

**원본 출처:** AI_RUNTIME_TRAINING_SPEC.md §4.1 Layer A  
**현재 상태:** 합성 캔들 생성 방식은 있지만, 시나리오 전체 패킷이 어떤 구조인지 없음.  
**추가할 내용:**
```ts
// 배틀 시작 시 생성되는 시나리오 패킷 (MVP)
interface ScenarioPacket {
  stageId: string
  symbol: 'BTC' | 'ETH' | 'SOL'
  candleData: CandleSlice[]         // 26개
  zones: BattleZone[]               // support/resistance/liquidation/breakout
  objective: number                 // 시작값: 0
  difficulty: number                // 1~5
  seedRandom: number                // 합성 캔들 seed (스테이지별 고정)
  marketRegime: 'TRENDING_UP' | 'TRENDING_DOWN' | 'RANGING' | 'VOLATILE'
}

// marketRegime이 배틀에 미치는 영향
const regimeEffect = {
  TRENDING_UP:   { doctrineBonus: 'AGGRESSIVE', objFloor: 10 },
  TRENDING_DOWN: { doctrineBonus: 'CONTRARIAN', rivalAtkMult: 1.2 },
  RANGING:       { doctrineBonus: 'DEFENSIVE',  hesiteMod: +0.05 },
  VOLATILE:      { doctrineBonus: 'NONE',        chaosMod: true }
}
```

---

### 추가 필요 항목 8: 세션 시작 체크리스트 (프롬프트 앞에 붙이는 것)

**원본 출처:** CONTEXT_ENGINEERING.md §2.1 (AGENTS.md는 지도여야 함)  
**현재 상태:** E3에 산출물 강제는 있지만, 세션 최초 진입 시 Claude가 스스로 확인할 체크리스트가 없음.  
**추가할 내용:**
```
[세션 시작 체크리스트 — 이 프롬프트를 받으면 코딩 전에 반드시 확인]

□ 1. 현재 스프린트 번호와 목표를 명시했는가?
□ 2. 이번 범위가 [SPRINT COMMAND]에 적혀 있는가?
□ 3. 이전 스프린트 완료 조건이 ✅인가? (아니면 먼저 해결)
□ 4. 의존하는 파일(types.ts, config.ts)이 먼저 있는가?
□ 5. Svelte 5 runes 문법($state/$derived/$effect)을 쓰고 있는가?
□ 6. 수치를 하드코딩하지 않고 config.ts에서 import하는가?
□ 7. arc() 드로잉 전 Math.max(0, ...) 래핑을 했는가?

위 7개 중 하나라도 □이면 해당 항목 먼저 해결하고 코딩 시작.
```

---

## PART 4. 최종 액션 리스트

### 즉시 할 것

| # | 작업 | 방법 |
|---|---|---|
| 1 | 프로젝트 지식에 [A] 4개 파일 업로드 | Claude.ai 프로젝트 → Add content |
| 2 | `Cogochi_Dev_Prompt_20260308.md`에 추가 항목 8개 반영 | 이 문서 기준 |
| 3 | `AGENT_WATCH_LOG.md`, `README.md`, `SKILL.md` 프로젝트 지식에서 제외 | 컨텍스트 낭비 |

### 스프린트 진입 시 할 것

| Sprint | 그 세션에 추가로 붙일 파일 |
|---|---|
| Sprint 2 | BATTLE_RUNTIME_PRESENTATION_SPEC.md + CHART_BATTLE_SPEC.md + UIUX_SYSTEM.md |
| Sprint 3 | PROGRESSION_MODEL.md + AI_IMPLEMENTATION_CONTRACTS.md (앞 400줄) |
| Sprint 4 | AI_RUNTIME_TRAINING_SPEC.md + AI_IMPLEMENTATION_CONTRACTS.md 전체 + RELIABILITY.md |

### 나중에 할 것 (Post-MVP)

| # | 항목 |
|---|---|
| 1 | `PROJECT_CONTEXT.md` 현재 구현 상태 섹션 업데이트 (Sprint 완료마다) |
| 2 | `QUALITY_SCORE.md` 점수 갱신 |
| 3 | `PLANS.md` exec-plan 실제 사용 시작 |
| 4 | `RELIABILITY.md` 파인튜닝 루프 시작 시 기준으로 활용 |

---

*2026-03-08 — Cogochi_DocAudit_20260308.md v1.0*
