# CLAUDE.md

> 나침반. 모든 것을 설명하지 않는다.
> 왜 만드는가 / 파일이 어디 있는가 / 무엇을 하면 안 되는가.

---

## WHY

Cogochi = 차트가 전장인 AI 에이전트 육성 RPG.

플레이어는 트레이너다. 에이전트를 훈련시키고, 차트 위에서 진입 판단을 내리고, 팀의 성장으로 결과를 개선한다.

```
아닌 것: 트레이딩 시뮬레이터 / 자동 배틀러 / 차트 뷰어
맞는 것: 판단 RPG — agent → train → battle → reflect → improve
```

제품 비율: **훈련/메모리/실험 70% + 배틀 표현/평가 30%**

---

## WHAT — 파일 위치

```
docs/README.md                canonical doc router

docs/
  MASTER_GAME_SPEC.md        L0 진실 소스. 충돌 시 이 파일이 이긴다.
  AGENT_SYSTEM_DESIGN.md     L1 에이전트 시스템 (RAG, 훈련, 평가 루프)
  TECH_ARCHITECTURE.md       L1 스택 + 레이어 + 스토어 + 서비스
  BATTLEFIELD_DESIGN.md      L1 차트→게임 번역 규칙, 전투 문법
  VISUAL_WORLD_DESIGN.md     L1 렌더링 구조, 좌표계, UI 레이아웃
  SYSTEM_INTENT.md           운영/툴체인 호환용 압축 intent 레이어
  PRODUCT_SENSE.md           운영/툴체인 호환용 압축 heuristic 레이어

src/
  routes/                    프론트엔드 페이지 (`+page.svelte`)
  components/                프론트엔드 UI 컴포넌트
  lib/
    server/                  백엔드 라우트 어댑터, runtime artifact 로더, 서버 전용 조립기
    engine/                  ⚠ 전투 해결 + 판단 점수 계산 (결정론적)
    services/                백엔드 도메인 서비스 (RAG, 컨텍스트 조립, 평가, 반성)
      memory/                ⚠ 에이전트 메모리 writeback
    stores/                  프론트엔드 상태 소유 (playerStore, rosterStore, matchStore...)
    types.ts                 공유 타입 / 계약

src/routes/**/+page.server.ts
src/routes/**/+server.ts      SvelteKit 백엔드 진입점

.claude/
  skills/                    재사용 워크플로 (스킬 이름으로 호출)
  hooks/                     변경 전 체크리스트
```

---

## HOW — 규칙

**코드**
- Svelte 5 + TypeScript. `any` 금지.
- 프론트엔드와 백엔드는 같은 repo여도 설계상 분리한다.
- 프론트엔드 = `routes/*.svelte`, `components/`, `stores/`.
- 백엔드 = `+page.server.ts`, `+server.ts`, `lib/server/`, `services/`, `runtime/`, `scripts/`.
- 공유 결정론 코어 = `lib/engine/`, `types.ts`, 순수 계약/뷰모델.
- 라우트 → 스토어 호출만. 비즈니스 로직 금지.
- 스토어 → UI 상태와 오케스트레이션만. 점수 계산, provider 호출, 파일 접근, writeback 정책 금지.
- 백엔드 서비스 → 메모리 writeback, 평가 orchestration, runtime artifact 생성, provider 연동 담당.
- 프론트엔드가 모델/provider/영속성 스키마를 직접 소유하면 안 된다.
- 스토어 → 점수 계산 금지. engine 호출만.
- Canvas 렌더링 → 래퍼 컴포넌트 경유. 라우트 직접 소유 금지.
- 같은 기능을 설계할 때도 `frontend surface / shared domain / backend runtime` 3층으로 먼저 나눈 뒤 구현한다.

**게임 규칙 (변경 금지)**
- 가격은 불변. 과거 데이터. 플레이어가 바꾸는 건 판단뿐.
- 현재 시장 데이터 = 직접 인풋. RAG에 넣으면 평가 오염.
- 배틀 결과는 난수 아님. 판단 품질이 결정함.

**검증**
```bash
npm run check   # 타입 에러 없어야 함
npm run build   # 빌드 성공해야 함
```

**문서**
- 파일명: `{PROJECT}_{주제}_{YYYYMMDD}.md`
- 버전 파일 분기 금지. Changelog는 파일 내부에.
- L0(MASTER) 수정 전 반드시 확인 요청.
- 원본 덤프/수입 문서는 `docs/references/imported/` 아래에 둔다.

---

## 더 필요할 때

| 필요한 것 | 파일 |
|---|---|
| 게임 정의 전체 | `docs/MASTER_GAME_SPEC.md` |
| 에이전트 동작 원리 | `docs/AGENT_SYSTEM_DESIGN.md` |
| 차트 요소 게임 번역 | `docs/BATTLEFIELD_DESIGN.md` |
| 렌더링 구조 | `docs/VISUAL_WORLD_DESIGN.md` |
| 스택/스토어/서비스 | `docs/TECH_ARCHITECTURE.md` |
| 스킬 목록 | `.claude/skills/README.md` |
| 안전장치 체크리스트 | `.claude/hooks/README.md` |
