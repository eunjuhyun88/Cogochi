# Cogochi Runtime Project Context Bundle

This bundle is generated from canonical repo-local truth.
Goal: chart-native judgment RPG with owned-agent memory, mutation proof, and optional OpenClaw runtime enrichment

## Repo collaboration SSOT
Source: `README.md`

# Cogochi v1

> Single source of truth: this `README.md` is the canonical collaboration and execution guide for humans and agents.

Cogochi v1 workspace bootstrapped with Memento Kit.

## 0) Agent Collaboration Protocol (SSOT)

1. Re-read this `README.md` at the start of each non-trivial task.
2. Use `AGENTS.md` for mandatory execution rules.
3. Route documentation through `docs/README.md` instead of scanning the whole repo.
4. Record start/end evidence in `docs/AGENT_WATCH_LOG.md`.
5. Use semantic checkpoints for non-trivial work:
   - `npm run ctx:checkpoint -- --work-id "<W-ID>" --surface "<surface>" --objective "<objective>"`
6. Pass `npm run docs:check` and `npm run ctx:check -- --strict` before push or merge.
7. On feature branches, create a coordination claim before meaningful edits:
   - `npm run coord:claim -- --work-id "<W-ID>" --agent "<agent>" --surface "<surface>" --summary "<summary>" --path "<prefix>"`
   - feature branches should declare at least one owned path prefix
8. If project-specific `check`/`build` commands exist, wire them in `context-kit.json` and include them in your gate.
9. Do not commit `.agent-context/`.
10. Do not work directly on `main`; use a `codex/<task-name>` branch.

## 1) Overview

- Name: `Cogochi v1`
- Stack: `TBD`
- Phase: `initial bootstrap`
- Next deadline: `TBD`

## 1.1) Context Routing

The goal is not to read more files. The goal is to read the right files first.

1. Collaboration rules: `README.md`, `AGENTS.md`
2. Product compass: `CLAUDE.md`
3. Canonical doc router: `docs/README.md`
4. Product truth and gameplay scope: `docs/MASTER_GAME_SPEC.md`, `docs/AGENT_SYSTEM_DESIGN.md`
5. Battlefield and visual translation: `docs/BATTLEFIELD_DESIGN.md`, `docs/VISUAL_WORLD_DESIGN.md`
6. System intent and structure: `docs/SYSTEM_INTENT.md`, `ARCHITECTURE.md`
7. Context retrieval discipline and measurement: `docs/CONTEXT_ENGINEERING.md`, `docs/CONTEXT_EVALUATION.md`
8. Query-time retrieval layer: `docs/CONTEXTUAL_RETRIEVAL.md`
9. Agent blueprint design: `docs/AGENT_FACTORY.md`, `agents/README.md`
10. Tool contract design: `docs/TOOL_DESIGN.md`, `tools/README.md`
11. Agent runtime telemetry: `docs/AGENT_OBSERVABILITY.md`
12. Open-source platform layers: `docs/CONTEXT_PLATFORM.md`, `docs/SANDBOX_POLICY.md`
13. Parallel-agent ownership and handoff: `docs/MULTI_AGENT_COORDINATION.md`
14. Git operating rules: `docs/GIT_WORKFLOW.md`
15. Stable operating docs:
   - `docs/DESIGN.md`
   - `docs/ENGINEERING.md`
   - `docs/PLANS.md`
   - `docs/PRODUCT_SENSE.md`
   - `docs/QUALITY_SCORE.md`
   - `docs/RELIABILITY.md`
   - `docs/SECURITY.md`
   - `docs/HARNESS.md`
16. Historical material: `docs/archive/`

## 2) Quick Start

```bash
npm run safe:hooks
npm run safe:git-config
npm run docs:refresh
npm run docs:check
npm run safe:status
```

## 3) Context Commands

- `npm run ctx:save`
- `npm run ctx:checkpoint`
- `npm run ctx:compact`
- `npm run ctx:check -- --strict`
- `npm run ctx:restore -- --mode brief`
- `npm run ctx:restore -- --mode handoff`
- `npm run ctx:pin`

## 3.1) Coordination Commands

- `npm run coord:claim`
- `npm run coord:list`
- `npm run coord:check`
- `npm run coord:release`

## 3.2) Git Commands

- `npm run safe:git-config`
- `npm run safe:status`
- `npm run safe:worktree -- <task-name> [base-branch]`
- `npm run safe:sync`
- `npm run safe:sync:gate`

## 3.3) Platform Commands

- `npm run agent:refresh`
- `npm run agent:new -- --id "<agent-id>" --role "<role>" --surface "<surface>"`
- `npm run tool:refresh`
- `npm run tool:new -- --id "<tool-id>" --surface "<surface>"`
- `npm run agent:start -- --agent "<agent-id>" --surface "<surface>"`
- `npm run agent:event -- --type "<event-type>"`
- `npm run agent:finish -- --status success --baseline-minutes <n>`
- `npm run agent:report`
- `npm run registry:refresh`
- `npm run registry:query -- --q "<term>"`
- `npm run registry:describe -- --kind "<kind>" --id "<id>"`
- `npm run registry:serve`
- `npm run retrieve:refresh`
- `npm run retrieve:query -- --q "<term>"`
- `npm run eval:ab:record`
- `npm run eval:ab:refresh`
- `npm run value:demo`
- `npm run sandbox:check`

### Context Artifact Model

1. `snapshot`
   - machine state, branch state, changed files
2. `checkpoint`
   - semantic working memory
3. `brief`
   - fast resume surface
4. `handoff`
   - fuller transfer artifact for the next session or agent

Paths:

- `.agent-context/snapshots/`
- `.agent-context/checkpoints/`
- `.agent-context/briefs/`
- `.agent-context/handoffs/`
- `.agent-context/compact/`

## 4) Configuration

Project-specific truth for this kit lives in:

- `context-kit.json`
- `CLAUDE.md`
- `docs/MASTER_GAME_SPEC.md`
- `docs/AGENT_SYSTEM_DESIGN.md`
- `docs/BATTLEFIELD_DESIGN.md`
- `docs/VISUAL_WORLD_DESIGN.md`
- `docs/product-specs/*.md`
- `docs/design-docs/*.md`
- `docs/exec-plans/active/*.md`
- `docs/CONTEXT_ENGINEERING.md`
- `docs/CONTEXT_EVALUATION.md`
- `docs/CONTEXT_PLATFORM.md`
- `docs/CONTEXTUAL_RETRIEVAL.md`
- `docs/AGENT_FACTORY.md`
- `docs/TOOL_DESIGN.md`
- `docs/AGENT_OBSERVABILITY.md`
- `docs/MULTI_AGENT_COORDINATION.md`
- `docs/GIT_WORKFLOW.md`
- `docs/SANDBOX_POLICY.md`
- `agents/*.json`
- `tools/*.json`

If route, store, or API discovery differs from the defaults, update `context-kit.json`.

## Product compass
Source: `CLAUDE.md`

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

## Autoresearch program
Source: `program.md`

# Cogochi OpenClaw Autoresearch Program

This file is the repo-local organization program for running Cogochi in an `autoresearch` style.

The operator may be OpenClaw, Codex, Claude, or another coding agent, but the intended runtime for the game-facing AI is OpenClaw with deterministic fallback behavior.

## Objective

Build Cogochi into a `Pokemon-grade alpha` where the player can:

1. understand the next objective within 10 seconds
2. travel with a four-slot squad through a chart-native world
3. enter a short, readable clash from a real gate instead of a sterile menu
4. tune doctrine, indicators, scripts, and memory on one owned agent
5. run a fixed historical proof encounter and choose keep, quarantine, or revert
6. see that verdict change the creature's body, history, or care state
7. return to camp already knowing the next best action

This is not a generic chart tool, not a pure research loop, and not a dashboard with movement.

This is a `world-first judgment creature RPG`.

## Read First

Before making any change, read:

1. `README.md`
2. `AGENTS.md`
3. `CLAUDE.md`
4. `docs/SYSTEM_INTENT.md`
5. `docs/AGENT_SYSTEM_DESIGN.md`
6. `docs/product-specs/proof.md`
7. `docs/design-docs/COGOCHI_proof_validation_20260315.md`
8. `docs/exec-plans/active/COGOCHI_proof_validation_execution_20260315.md`
9. `docs/exec-plans/active/COGOCHI_founder_goal_20260312.md`
10. `docs/exec-plans/active/COGOCHI_autoresearch_org_20260312.md`
11. `docs/exec-plans/active/COGOCHI_autoresearch_scorecard_20260312.md`
12. `docs/exec-plans/active/COGOCHI_autoresearch_bottlenecks_20260312.md`
13. `docs/exec-plans/active/COGOCHI_judgment_tamagotchi_loop_20260312.md`
14. `docs/exec-plans/active/COGOCHI_full_game_autoresearch_20260312.md`
15. `docs/design-docs/judgment-tamagotchi-loop.md`
16. `docs/design-docs/atlas-judgment-evolution.md`
17. `docs/design-docs/chartfield-fullgame-direction.md`
18. `docs/design-docs/COGOCHI_pokemon_grade_game_target_20260313.md`
19. `docs/design-docs/COGOCHI_memento_runtime_architecture_20260315.md`
20. `docs/exec-plans/active/COGOCHI_pokemon_grade_autoresearch_20260313.md`
21. `docs/exec-plans/active/COGOCHI_memento_autoresearch_refactor_20260315.md`
22. `docs/product-specs/evolution.md`

## Hard Product Rules

- The player is a trainer, not a trader bot operator.
- The chart is the battlefield and evaluation surface, not decorative wallpaper.
- Current market state is direct input, not RAG memory.
- Battle outcomes must stay explainable and deterministic.
- Training, memory, and experimentation matter more than spectacle, but the product must still read as a game first.
- Prompts, scripts, retrieval, and doctrine are treated as mutable genes.
- Keep or revert decisions must use fixed historical proof packs, not live capital.
- Do not use Sharpe or PnL as the sole loss function for game progression.
- Do not optimize for win rate alone if it hurts product clarity.
- Do not drift into brokerage, passive chart viewing, or pet-only care loops.
- Do not treat visible growth as optional polish.
- Do not accept a high score if the first five minutes still feel like panel reading instead of travel and encounter play.

## Atlas Translation Rules

When adapting the Atlas pattern:

- `25 debate agents` become an internal judgment council behind four visible companions
- `Darwinian weights` become player-readable trust weights
- `worst agent rewrite` becomes one bounded mutation proposal against the current weak link
- `CIO bottleneck` becomes a measurable squad-captain bottleneck
- `keep or revert` happens only after a deterministic proof pack rerun

## Memento Translation Rules

Cogochi adopts the Memento layer model like this:

- `Core`
  - repo-local product truth, route contracts, and deterministic battle rules
- `Memory`
  - owned-agent writeback in `src/lib/services/memory/` with `M0/M30/M90/M365` tiering
- `Runtime`
  - `runtime/` boot bundles, memory index, distill reports, and OpenClaw-facing prompts

Do not mix these layers.

- Core must stay team-shared and canonical.
- Memory must stay attributable to training, battle, or distill events.
- Runtime must consume the other two layers without replacing them.

## Nanochat Round Discipline

Use the `nanochat` round-1 pattern as a discipline rule, not as a training target:

- one round should attack one bounded bottleneck
- a surviving round should usually touch a small file cluster, not sprawl across the repo
- keep only changes that generalize across the product loop, not one screenshot or one ad hoc case
- prefer a few coherent changes that reinforce each other over many unrelated tweaks

For Cogochi this means a valid round usually changes one of:

- `memory boundary`
- `runtime bundle and distill rail`
- `field/battle/journal loop`
- `raising and mutation proof readability`

## OpenClaw Runtime Assumption

The target runtime is OpenClaw served through a local compatible API.

Acceptable runtime paths:

- OpenClaw on a local OpenAI-compatible endpoint
- OpenClaw on a local Ollama-like endpoint
- deterministic local fallback when OpenClaw is unavailable

The runtime is used to enrich:

- reflection
- memory retrieval summaries
- player guidance
- agent personality expression

The runtime must not be required for the core deterministic evaluation loop to function.

## Allowed Edit Scope

Prefer small, testable, single-bottleneck changes.

Allowed:

- `src/`
- `static/`
- `agents/`
- `tools/`
- `docs/product-specs/`
- `docs/design-docs/`
- `docs/exec-plans/active/`
- `program.md`

Do not edit L0 product truth without explicit human confirmation:

- `docs/MASTER_GAME_SPEC.md`

## Evaluator Commands

Run these after meaningful changes:

```bash
npm run autoresearch:openclaw
npm run autoresearch:battle
npm run autoresearch:field
npm run autoresearch:raising
npm run autoresearch:runtime
npm run autoresearch:score
npm run autoresearch:accept
```

For the first scoring pass, establish the baseline:

```bash
npm run autoresearch:accept -- --set-baseline
```

## Operating Loop

1. Read the founder goal and current bottlenecks.
2. Pick the highest-priority blocker to the founder goal.
3. Make one narrow change in owned paths.
4. Run the relevant evaluator set.
5. If the change touched memory or runtime, run `npm run runtime:all` and `npm run autoresearch:runtime`.
6. Run `npm run autoresearch:score`.
7. Run `npm run autoresearch:accept`.
8. If accepted, keep the change and update scorecard/bottlenecks.
9. If rejected, do not keep the change. Prefer small uncommitted experiments so rejection is cheap.
10. Write a short checkpoint and continue.

Continue until:

- the current founder milestone exit criteria are met
- or the human interrupts

## Optimization Priority

Optimize in this order:

1. world-first session loop
2. encounter legibility and one-objective clashes
3. visible evolution plus mutation proof
4. return-pressure clarity
5. trust calibration and orchestration clarity
6. training-to-battle proof
7. memory and care loop usefulness
8. battle explainability
9. visual polish

## From-Scratch Clarification

`From scratch` in this repo means:

- building the product and training loop from zero inside this workspace
- creating the agent configuration, memory loop, evaluation loop, and UI surfaces from zero

It does **not** mean:

- pretraining a foundation model from scratch in v1
- shipping a brokerage product
- using live execution as the core loop

## Agent system truth
Source: `docs/AGENT_SYSTEM_DESIGN.md`

# Cogochi Agent System Design

Last updated: 2026-03-06

## 1. Purpose

This document is the buildable source of truth for Cogochi as an AI agent raising and evaluation simulator.

It defines:

- the product thesis
- the domain model
- the RAG runtime
- the training loop
- the evaluation battle loop
- the page and store responsibilities
- the implementation order

If another document conflicts with this one, this document wins.

## 2. Product Thesis

Cogochi is not primarily a monster battler.

Cogochi is a game where the player owns AI agent instances built on top of a base model, configures their prompts, data sources, and memory, retrains them over time, and sends them into evaluation matches to see whether their preparation was better than the opponent's.

The battle layer exists to prove whether the training setup worked.

The product ratio is:

- 70% agent training, memory, and experimentation
- 30% battle presentation and evaluation

## 3. Core Loop

The correct product loop is:

`base model -> owned agent -> data and memory setup -> prompt/policy tuning -> squad formation -> evaluation match -> reflection -> memory writeback -> progression`

Short version:

`agent -> train -> evaluate -> reflect -> improve`

### 3.1 Proof Versus Battle

Cogochi needs two evaluation layers:

- `battle`
  - one readable clash on one historical frame
- `proof`
  - one deterministic historical validation bundle around several clashes

The player-facing word can stay `proof`.
The system-facing concept is a game-native backtest.

Battle answers:

- what happened in this clash

Proof answers:

- whether this mutation or setup deserves trust beyond one clash

## 4. Non-Goals

The MVP does not attempt to do the following:

- full custom pretraining from scratch
- real brokerage or exchange integration
- real-money trading
- synchronous live PvP with authoritative servers
- giant cloud training orchestration
- tokenomics or NFT systems

## 5. Design Principles

### 5.1 The player owns agents, not species

Species or archetypes are presentation and default configuration layers.

The real gameplay object is the owned agent instance.

### 5.2 Current market state is direct input, not RAG

Structured current state such as price, news score, volatility, or OI is fed directly to the model.

RAG is used for past experiences, playbooks, failures, and user doctrine.

### 5.3 Battle is evaluation, not the whole product

The battle screen must answer:

- what the agent saw
- what memory it retrieved
- why it made the decision
- how that decision performed

### 5.4 Growth means better decisions

Progression is not just XP.

Progression means:

- stronger policy
- better retrieval quality
- cleaner memory
- clearer specialization
- better coordination with the squad

## 6. Terminology

### BaseModel

The inference model the agent runs on top of.

Example:

- `qwen2.5-7b-instruct`

### Archetype

A visual and gameplay-flavor template that provides:

- default prompts
- suggested data sources
- visual identity
- starter role hints

Archetypes are not the same thing as owned agents.

### OwnedAgent

A player-owned agent instance with its own:

- prompt stack
- data bindings
- retrieval policy
- memory bank
- history
- progression

### TrainingLoadout

The active behavior definition of one agent.

It includes:

- system prompt
- role prompt
- policy prompt
- risk style
- retrieval policy
- enabled tools
- enabled data sources

### MemoryBank

The searchable memory attached to an agent.

It stores:

- match summaries
- failure cases
- success cases
- generalized playbooks
- user-authored notes

### TrainingRun

A recorded improvement operation against one agent.

Examples:

- prompt revision
- retrieval tuning
- memory compaction
- SFT or LoRA run

### EvalScenario

A controlled benchmark setting used for one match.

Examples:

- trend day with high OI
- volatile chop regime
- macro shock news window

### EvalMatch

One evaluation battle run under a defined scenario.

### RewardPacket

The post-match progression output that updates:

- the agent
- the player profile
- the memory bank

## 7. Domain Model

```ts
export type AgentRole = 'SCOUT' | 'ANALYST' | 'RISK' | 'EXECUTOR';
export type AgentStatus = 'READY' | 'TRAINING' | 'QUEUED' | 'IN_MATCH' | 'RECOVERING';
export type DataSourceKind = 'PRICE' | 'NEWS' | 'ONCHAIN' | 'SOCIAL' | 'USER_NOTE' | 'MACRO';
export type ToolKind = 'RETRIEVER' | 'SUMMARIZER' | 'SCORER' | 'RISK_FILTER';
export type MemoryKind = 'MATCH_SUMMARY' | 'FAILURE_CASE' | 'SUCCESS_CASE' | 'PLAYBOOK' | 'USER_NOTE';
export type TrainingRunType = 'PROMPT_TUNE' | 'RETRIEVAL_TUNE' | 'MEMORY_COMPACT' | 'SFT' | 'LORA' | 'CPT';
export type MatchMode = 'PVE_BENCHMARK' | 'GHOST_DUEL' | 'ASYNC_PVP';
```

### 7.1 BaseModelDefinition

```ts
export interface BaseModelDefinition {
  id: string;
  family: string;
  variant: string;
  provider: 'OLLAMA' | 'OPENAI_COMPAT';
  parameterScale: 'SMALL' | 'MEDIUM' | 'LARGE';
  contextWindow: number;
  supportsJsonMode: boolean;
  supportsToolUse: boolean;
}
```

### 7.2 AgentArchetype

```ts
export interface AgentArchetype {
  id: string;
  name: string;
  fantasy: string;
  visualType: string;
  defaultRole: AgentRole;
  defaultLoadout: TrainingLoadoutTemplate;
  starterTags: string[];
}
```

```ts
export interface TrainingLoadoutTemplate {
  systemPrompt: string;
  rolePrompt: string;
  policyPrompt: string;
  enabledDataSourceKinds: DataSourceKind[];
  enabledToolKinds: ToolKind[];
  riskTolerance: number;
  confidenceStyle: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
  horizon: 'SCALP' | 'INTRADAY' | 'SWING';
}
```

### 7.3 OwnedAgent

```ts
export interface OwnedAgent {
  id: string;
  name: string;
  archetypeId: string;
  baseModelId: string;
  role: AgentRole;
  status: AgentStatus;
  level: number;
  xp: number;
  bond: number;
  specializationTags: string[];
  loadout: TrainingLoadout;
  memoryBankId: string;
  record: AgentRecord;
  progression: AgentProgression;
  createdAt: number;
  updatedAt: number;
}
```

```ts
export interface AgentRecord {
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  lastOutcome?: 'WIN' | 'LOSS' | 'DRAW';
  lastMatchAt?: number;
}

export interface AgentProgression {
  specializationTier: number;
  unlockedToolIds: string[];
  unlockedDataSourceIds: string[];
  memoryCapacityBonus: number;
}
```

Invariants:

- `id` is globally unique
- one agent has exactly one active `loadout`
- one agent has exactly one `memoryBankId`
- one agent can exist in at most one active squad slot at a time

### 7.4 TrainingLoadout

```ts
export interface TrainingLoadout {
  systemPrompt: string;
  rolePrompt: string;
  policyPrompt: string;
  enabledDataSourceIds: string[];
  enabledToolIds: string[];
  riskTolerance: number;
  confidenceStyle: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
  horizon: 'SCALP' | 'INTRADAY' | 'SWING';
  retrievalPolicy: RetrievalPolicy;
  outputSchemaVersion: string;
}

export interface RetrievalPolicy {
  topK: number;
  recencyWeight: number;
  similarityWeight: number;
  successWeight: number;
  importanceWeight: number;
  roleMatchWeight: number;
  regimeMatchWeight: number;
}
```

Invariants:

- `riskTolerance` is `0..1`
- `topK` is `1..10`
- every referenced data source must exist in the lab catalog

### 7.5 DataSourceBinding

```ts
export interface DataSourceBinding {
  id: string;
  kind: DataSourceKind;
  name: string;
  enabled: boolean;
  qualityScore: number;
  config: Record<string, string | number | boolean>;
  lastSyncedAt?: number;
}
```

### 7.6 ToolBinding

```ts
export interface ToolBinding {
  id: string;
  kind: ToolKind;
  name: string;
  enabled: boolean;
  description: string;
}
```

### 7.7 MemoryRecord and MemoryBank

```ts
export interface MemoryRecord {
  id: string;
  agentId: string;
  kind: MemoryKind;
  title: string;
  summary: string;
  lesson: string;
  tags: string[];
  role: AgentRole;
  regime: string;
  symbol: string;
  timeframe: string;
  sourceIds: string[];
  successScore: number;
  importance: number;
  retrievalCount: number;
  createdAt: number;
  lastRetrievedAt?: number;
}

export interface MemoryBank {
  id: string;
  agentId: string;
  capacity: number;
  compactionLevel: number;
  records: MemoryRecord[];
}
```

Invariants:

- only records created before the current scenario start can be retrieved
- raw logs are not stored as long-term memory records
- only summarized, tagged records enter the bank

### 7.8 TrainingRun

```ts
export interface TrainingRun {
  id: string;
  agentId: string;
  type: TrainingRunType;
  hypothesis: string;
  changes: string[];
  beforeVersion: string;
  afterVersion: string;
  metricsBefore?: EvalMetrics;
  metricsAfter?: EvalMetrics;
  status: 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED';
  startedAt?: number;
  finishedAt?: number;
}
```

### 7.9 Squad

```ts
export interface Squad {
  id: string;
  name: string;
  memberAgentIds: [string, string, string, string];
  roleMap: {
    scout: string;
    analyst: string;
    risk: string;
    executor: string;
  };
  tacticPreset: 'BALANCED' | 'TREND' | 'DEFENSIVE' | 'EXPERIMENTAL';
}
```

Invariants:

- exactly four agents
- no duplicate agent ids
- each role is assigned exactly once

### 7.10 EvalScenario

```ts
export interface EvalScenario {
  id: string;
  mode: MatchMode;
  symbol: string;
  timeframe: string;
  marketWindowId: string;
  objective: string;
  allowedDataSourceKinds: DataSourceKind[];
  scoringWeights: EvalScoreWeights;
  opponentSnapshotId?: string;
  scenarioStartAt: number;
}
```

### 7.11 OpponentSnapshot

```ts
export interface OpponentSnapshot {
  id: string;
  label: string;
  squad: SquadSnapshot;
  createdAt: number;
}

export interface SquadSnapshot {
  memberNames: string[];
  roles: AgentRole[];
  summarizedPolicies: string[];
}
```

### 7.12 EvalMatchResult

```ts
export interface EvalMatchResult {
  id: string;
  scenarioId: string;
  squadId: string;
  outcome: 'WIN' | 'LOSS' | 'DRAW';
  teamMetrics: EvalMetrics;
  agentResults: AgentEvalResult[];
  rewards: RewardPacket;
  lessons: string[];
  createdAt: number;
}

export interface AgentEvalResult {
  agentId: string;
  action: 'LONG' | 'SHORT' | 'FLAT';
  confidence: number;
  accuracyScore: number;
  coordinationScore: number;
  reasoningScore: number;
  xpGain: number;
  bondGain: number;
  memoryWrites: MemoryRecord[];
}

export interface EvalMetrics {
  returnScore: number;
  riskScore: number;
  accuracyScore: number;
  calibrationScore: number;
  reasoningScore: number;
  coordinationScore: number;
  totalScore: number;
}

export interface EvalScoreWeights {
  returnWeight: number;
  riskWeight: number;
  accuracyWeight: number;
  calibrationWeight: number;
  reasoningWeight: number;
  coordinationWeight: number;
}

export interface RewardPacket {
  trainerResearchGain: number;
  unlockProgressGain: number;
  agentXpGain: Record<string, number>;
  agentBondGain: Record<string, number>;
}
```

## 8. Runtime Architecture

The MVP is local-first.

The runtime layers are:

```text
Routes
  -> Stores
  -> Services
  -> Model Provider / Memory Provider
  -> Eval Resolver
```

### 8.1 Route Responsibilities

- `src/routes/+page.svelte`
  - Agent Ops Hub
- `src/routes/roster/+page.svelte`
  - owned agent list and filtering
- `src/routes/agent/[id]/+page.svelte`
  - one agent deep detail
- `src/routes/team/+page.svelte`
  - role-based squad assignment
- `src/routes/battle/+page.svelte`
  - evaluation console
- `src/routes/lab/+page.svelte`
  - training queue and data setup

Routes assemble views only.

No route should contain RAG logic or scoring logic.

### 8.2 Store Responsibilities

#### playerStore

- trainer profile
- research points
- unlocked systems

#### rosterStore

- owned agents
- selected agent id
- agent updates
- apply rewards to agents

#### squadStore

- active squad
- saved squad presets
- slot validation

#### labStore

- data source catalog
- tools catalog
- training runs
- prompt variants
- memory compaction jobs

#### matchStore

- current evaluation scenario
- current phase
- per-agent traces
- match lifecycle

### 8.3 Service Responsibilities

#### modelProvider

- call the selected base model
- enforce JSON output schema

#### embeddingProvider

- generate embeddings for memory records

#### memoryService

- write memory records
- retrieve memory records
- compact memory banks

#### contextAssembler

- build the final prompt package for each agent

#### evalService

- compute match metrics
- score agents and squads

#### reflectionService

- turn raw match traces into lessons and memory cards

## 9. RAG Design

RAG is mandatory, but it is not used for everything.

### 9.1 What goes in direct structured input

The following belong in the current scenario payload:

- price and derived indicators
- volatility
- OI and funding
- macro event flags
- news scores
- opponent summary
- current squad messages

These values are not retrieved from memory.

### 9.2 What goes in RAG memory

Only durable experience should enter the memory bank:

- previous match summaries
- failure cases
- success cases
- generalized playbook lessons
- user doctrine

### 9.3 Retrieval pipeline

For each agent turn:

1. Build a retrieval query using current role, regime, symbol, timeframe, and objective
2. Filter memory records that are eligible
3. Rank by hybrid score
4. Return top-k summarized records
5. Assemble them into context

### 9.4 Eligibility rules

A memory record is eligible only if:

- `record.agentId == currentAgentId`
- `record.createdAt <= scenario.scenarioStartAt`
- role or tags are relevant enough
- it is not archived or invalidated

This prevents future leakage during evaluation.

### 9.5 Hybrid retrieval score

The retrieval score is:

```text
score =
  similarityWeight * semanticSimilarity +
  recencyWeight * recencyScore +
  successWeight * normalizedSuccessScore +
  importanceWeight * importance +
  roleMatchWeight * roleMatch +
  regimeMatchWeight * regimeMatch
```

Recommended defaults:

- semantic similarity: `0.45`
- recency: `0.15`
- success score: `0.15`
- importance: `0.10`
- role match: `0.10`
- regime match: `0.05`

### 9.6 Memory writeback

After every match:

1. Keep the raw trace in short-term match storage
2. Generate a structured reflection
3. Extract at most 1 to 3 durable memory cards per agent
4. Tag them with scenario metadata
5. Save them into the agent memory bank

### 9.7 Memory compaction

Compaction is a training action, not an invisible cleanup job.

It should:

- merge duplicate lessons
- archive stale low-value records
- promote repeated high-value rules into `PLAYBOOK` records
- reduce prompt context bloat

## 10. Prompt Assembly

Each agent turn is built from the following layers:

```text
1. System Prompt
2. Role Prompt
3. Policy Prompt
4. Scenario Structured State
5. Retrieved Memories
6. Squad Messages
7. Output Schema Instructions
```

The output must be structured JSON.

```ts
export interface AgentDecision {
  action: 'LONG' | 'SHORT' | 'FLAT';
  confidence: number;
  thesis: string;
  evidence: string[];
  riskNote: string;
  invalidation: string;
  messageToSquad: string;
}
```

The model provider must reject or repair malformed outputs before match resolution.

## 11. Training System

The training system has three layers.

### 11.1 Fast loop

Runs often and powers the main gameplay:

- prompt edits
- retrieval policy edits
- memory compaction
- data source enabling and disabling

### 11.2 Medium loop

Runs after multiple matches:

- prompt variant comparison
- benchmark suite runs
- lesson curation

### 11.3 Slow loop

Optional advanced system:

- SFT
- LoRA
- continued pretraining

The MVP only requires the fast loop and medium loop.

### 11.4 Training queue states

```text
QUEUED -> RUNNING -> DONE | FAILED
```

Every training run must record:

- what changed
- why it changed
- what metrics improved or regressed

## 12. Evaluation Match Design

Battle is an evaluation console with strong presentation.

### 12.1 Squad roles

The four default roles are:

- `SCOUT`
  - find candidate signals
- `ANALYST`
  - explain the thesis
- `RISK`
  - bound downside and veto bad entries
- `EXECUTOR`
  - produce the final team action

### 12.2 Match phases

The match phases are:

1. `OBSERVE`
2. `RETRIEVE`
3. `REASON`
4. `DEBATE`
5. `DECIDE`
6. `RESOLVE`
7. `REFLECT`

### 12.3 Score model

Default team score weights:

- return: `0.35`
- risk control: `0.20`
- accuracy: `0.15`
- calibration: `0.10`
- reasoning quality: `0.10`
- coordination: `0.10`

### 12.4 Reward rules

Trainer rewards:

- research points
- unlock progress

Agent rewards:

- XP
- bond
- memory cards
- specialization progress

### 12.5 Match outputs

One match must produce:

- final outcome
- per-agent decision trace
- per-agent score breakdown
- reward packet
- reflection lessons

## 13. UI and UX Structure

### 13.1 `/` Agent Ops Hub

Must show:

- active squad
- key agents
- recent match results
- training queue
- recommended next action

### 13.2 `/roster`

Must show:

- owned agent grid
- filters by role, model, specialization
- recent performance
- memory health

### 13.3 `/agent/[id]`

This is the most important page.

It must show:

- identity and archetype
- base model
- prompt stack
- data bindings
- retrieval policy
- memory bank preview
- training history
- evaluation history

### 13.4 `/team`

Must behave as a four-slot role board, not a simple checklist.

### 13.5 `/battle`

Must center on:

- phase timeline
- decisions
- retrieved memories
- messages between squad members
- score panel

### 13.6 `/lab`

Must center on:

- data source setup
- prompt variants
- memory compaction
- training queue
- evaluation presets

## 14. Persistence Plan

The MVP uses local persistence with versioned keys.

Recommended keys:

- `cogochi.player.v2`
- `cogochi.roster.v2`
- `cogochi.squad.v2`
- `cogochi.lab.v2`
- `cogochi.match-history.v2`

Migration is required whenever schema versions change.

## 15. Suggested File Map

```text
src/lib/aimon/
  data/
    baseModels.ts
    agentArchetypes.ts
    evalScenarios.ts
  services/
    modelProvider.ts
    embeddingProvider.ts
    memoryService.ts
    contextAssembler.ts
    evalService.ts
    reflectionService.ts
  stores/
    playerStore.ts
    rosterStore.ts
    squadStore.ts
    labStore.ts
    matchStore.ts
  engine/
    evalEngine.ts
    phaseMachine.ts
  types.ts
```

## 16. MVP Build Order

### Step 1. Types and storage boundaries

Deliverables:

- target domain types in `types.ts`
- storage key versions
- empty stores with typed interfaces

Definition of done:

- no more `teamDexIds` as product-facing truth

### Step 2. Roster-first data model

Deliverables:

- `rosterStore`
- starter agents
- `squadStore`
- `/roster`

Definition of done:

- the app can render owned agents that are not just species ids

### Step 3. Agent detail and lab

Deliverables:

- `/agent/[id]`
- prompt editor
- data source toggles
- retrieval policy editor
- memory preview

Definition of done:

- one agent can be configured end to end

### Step 4. Evaluation battle

Deliverables:

- `matchStore`
- phase timeline
- structured decisions
- per-agent scoring

Definition of done:

- a full eval run can start and end using owned agents

### Step 5. Reflection and progression

Deliverables:

- reward packet application
- memory writeback
- training queue seeding

Definition of done:

- one match changes the next match through memory and progression

## 17. Acceptance Criteria

The product is on track only if all of the following are true:

1. The player remembers individual agents by role and behavior
2. Data and memory choices change match outcomes
3. The battle screen explains why a result happened
4. Match results update the roster, not just a global XP number
5. RAG affects future decisions through visible retrieval and writeback

## Battlefield grammar
Source: `docs/BATTLEFIELD_DESIGN.md`

# Battlefield Design

Status: canonical  
Last updated: 2026-03-08

## 1. Purpose

This document defines how a crypto price chart becomes a playable battlefield.

It exists to solve four missing pieces:

- how the chart reads as terrain
- how a long or short position is visibly expressed
- how the player avatar and 3 companion agents operate on the field
- how battle outcomes become learning and progression instead of monetary payout

This document is the canonical battlefield contract.
It defines battle grammar and chart translation rules, not rendering implementation details and not code architecture ownership.

## 2. Core Thesis

The chart is not decoration.
The chart is the map, terrain, history layer, and combat lane.

The player does not change the market.
The player chooses where to commit, where to hold, where to retreat, and how to train a squad to read and survive the market better.

The battlefield must always communicate:

- what part of history is visible
- where the current active combat zone is
- where a long or short thesis was committed
- which side currently owns vertical pressure
- what the companions are contributing to the decision

## 3. Design Goals

- The player must be able to say, at a glance, "a long was committed there" or "that short got trapped there."
- The whole chart must remain recognizable as BTC or another coin chart, even during combat.
- Battle must feel like interpretation of market structure, not abstract fantasy combat detached from price action.
- The 3 companion agents must feel useful and trainable, not cosmetic followers.
- Match rewards must reinforce learning quality, team cohesion, and doctrine growth, not fake profit.

## 4. Non-Goals

- This is not a live trading simulator.
- This is not paper trading with a skin.
- The player does not directly move candles or rewrite price history.
- The player does not earn real money from battle outcomes.
- The battlefield should not become a generic RPG map with a chart wallpaper behind it.

## 5. Battlefield Coordinate Model

### 5.1 Axes

- `X axis`: time progression
- `Y axis`: price level

### 5.2 Ownership Read

- player squad pressure generally rises from lower regions toward upper regions
- rival squad pressure generally descends from upper regions toward lower regions
- long commitment usually attempts upward territory capture
- short commitment usually attempts downward pressure or denial

This vertical read is more important than clean left-to-right readability.

### 5.3 Visible Layers

The battlefield always renders three simultaneous layers:

1. `History Layer`
   - the broader chart history
   - faded but readable
   - used for market context and memory
2. `Active Zone Layer`
   - the current battle slice
   - high contrast
   - where units move and commit
3. `Tactical Overlay Layer`
   - temporary grid, position markers, danger zones, path indicators
   - appears only when decisions or clashes need precision

## 6. Chart Terrain Grammar

### 6.1 Candle Terrain

- `Bull Candle`
  - rising support energy
  - easier upward movement
  - improves long commitment stability
- `Bear Candle`
  - downward compression
  - easier descent or short pressure
  - increases knockback risk for weak longs
- `Large Body Candle`
  - momentum lane
  - faster movement but higher commitment cost
- `Long Wick`
  - unstable footing
  - signals rejection, trap, fake breakout, or panic sweep
- `Tight Candle Cluster`
  - range box
  - low mobility, high setup potential

### 6.2 Structural Terrain

- `Support Platform`
  - safe foothold
  - grants brace and recovery
- `Resistance Wall`
  - hard barrier
  - must be broken, bypassed, or respected
- `Breakout Gate`
  - threshold object
  - if captured, grants momentum swing
- `Range Box`
  - compressed neutral zone
  - favors setup, feint, and trap play
- `Long Liquidation Trap`
  - punishes overextended longs
- `Short Liquidation Trap`
  - punishes overextended shorts
- `Volume Spring`
  - burst source that launches units vertically
- `Volatility Storm`
  - unstable region with movement and targeting variance
- `Funding Bias Beam`
  - directional pressure modifier
- `Macro Shock Beacon`
  - scripted event anchor that changes local rules

### 6.3 Terrain Rule

Every visible terrain object must answer:

- can units stand on it
- does it push upward or downward
- does it grant safety or danger
- does it invite long, short, or hold

If the object cannot answer those four questions, it should not exist in MVP.

## 7. Position Event Grammar

This is the most important missing layer in the current design.

### 7.1 Long Commit

Meaning:
- the player believes this region should be defended and pushed upward

Visual:
- green position marker planted from below
- upward thrust line or banner
- squad compresses, then surges upward

Gameplay:
- starts a territory push
- creates a `Long Commitment Zone`
- may trigger clash if rival pressure is present

### 7.2 Short Commit

Meaning:
- the player believes this region should fail or be forced downward

Visual:
- red marker dropped from above
- downward strike line
- squad leans and descends with pressure effect

Gameplay:
- starts a pressure collapse attempt
- creates a `Short Commitment Zone`
- may trigger clash if defenders are present

### 7.3 Hold

Meaning:
- the player chooses not to force a thesis yet

Visual:
- neutral stance
- companions spread, scan, and pulse information

Gameplay:
- increases information quality
- reduces immediate reward
- improves safety and confidence recovery

### 7.4 Breakout Claim

Meaning:
- the player tries to convert a resistance threshold into owned territory

Visual:
- wall fracture
- rails or shards flying upward
- team silhouette crosses the line

Gameplay:
- if successful, objective swing and momentum bonus
- if failed, recoil, hesitation, and exposure

### 7.5 Rejection

Meaning:
- price touched a level but could not own it

Visual:
- bounce spark
- wall flash
- body knockback

Gameplay:
- confidence loss for the aggressor
- counter window for the defender

### 7.6 Liquidation

Meaning:
- a badly overcommitted position gets structurally punished

Visual:
- formation collapse
- sudden downward or upward devour effect
- companion panic or scatter animation

Gameplay:
- heavy HP and confidence damage
- memory writeback candidate
- strong reflection reward if survived and learned from

## 8. Player and Companion Model

### 8.1 Field Composition

The player field presence is:

- `Player Avatar`
- `Companion 1`
- `Companion 2`
- `Companion 3`

The player avatar is the visible executor of commitment.
The companions are the trainable agents.

### 8.2 Companion Roles

MVP roles:

- `Scout`
  - discovers candidate zones
  - extends visible battle forecast
- `Analyst`
  - strengthens long or short thesis confidence
  - increases interpretation quality
- `Risk`
  - warns of trap, liquidation, or failed chase
  - improves retreat timing and survival

### 8.3 Formation Rule

Default field read:

- player avatar stays at the center of the micro formation
- companions occupy stable follow offsets
- during commitment, one or more companions break formation briefly to express role contribution

Example:

- Scout dashes ahead to mark a breakout gate
- Analyst projects a thesis line onto a resistance wall
- Risk drops a warning dome over a liquidation trap

Companions should not constantly run independently in MVP.
They should mostly read as "decision satellites" attached to the player.

## 9. Movement Model

### 9.1 Traversal States

- `Traverse`
  - moving across chart terrain
  - no precise combat overlay
- `Aim`
  - choosing a position to commit
  - tactical overlay appears
- `Clash`
  - battle logic active
  - high readability, short duration
- `Resolve`
  - outcome display
  - damage, objective shift, memory candidate display
- `Retreat`
  - fallback or reset motion

### 9.2 Vertical Movement

Units may:

- stand directly on a candle close line
- hover slightly above structure lines
- drop below the close line when losing ground
- leap between support footholds

This means the field is not a strict platformer surface.
It is a readable tactical motion layer derived from price structure.

### 9.3 Tactical Lock

Inspired by tactical RPG readability, the active battle slice may enter `Tactical Lock`.

In this mode:

- a soft grid overlays the active chart zone
- movement is shown in discrete local tiles
- the full chart remains visible underneath
- AP, action ranges, and hazard zones become explicit

Use this mode only when:

- the player is selecting commit direction
- a clash is about to begin
- a special skill requires precise local placement

Do not keep the grid on permanently.
The chart must remain the primary visual identity.

## 10. Battle Trigger Rules

Battle does not happen on every candle.
Battle starts when a decision is contested or risky enough to matter.

### 10.1 Trigger Families

- `Contested Commitment`
  - player long or short overlaps rival ownership
- `Breakout Attempt`
  - player challenges a resistance or support threshold
- `Trap Activation`
  - commitment intersects liquidation zone or false move zone
- `Volatility Event`
  - scripted movement spike destabilizes local terrain
- `Opportunity Clash`
  - a rare high-value zone appears and both sides converge

### 10.2 Non-Battle Moments

These should remain exploration or scouting:

- low-signal noise regions
- flat range zones with no commitment
- post-result cooldown movement

This prevents the game from turning every movement beat into meaningless combat.

## 11. Match State Machine

Recommended player-facing phase order:

1. `Survey`
   - read chart and visible structures
2. `Mark`
   - Scout and Analyst identify candidate commitment zones
3. `Commit`
   - player chooses long, short, or hold
4. `Clash`
   - local battle resolves against opposing pressure
5. `Resolve`
   - objective, HP, confidence, and zone ownership update
6. `Reflect`
   - lesson cards and companion growth are awarded

Internal system alignment can still map these onto:

- OBSERVE
- RETRIEVE
- REASON
- DECIDE
- RESOLVE
- REFLECT

## 12. Objective and Failure Model

### 12.1 What Victory Means

Victory is not "made money."
Victory means:

- committed in a structurally valid place
- survived the risk profile
- correctly captured or defended territory
- coordinated the squad well
- extracted useful learning

### 12.2 What Score Should Measure

- structural correctness of entry
- thesis quality
- timing quality
- risk discipline
- survival
- companion coordination
- memory value generated

### 12.3 Failure States

- `Bad Thesis`
  - entered against obvious structure
- `Late Chase`
  - entered too late into exhaustion
- `Trap Death`
  - ignored warning signs
- `Panic Exit`
  - abandoned good structure too early
- `Coordination Failure`
  - companions were trained badly or brought the wrong composition

Failure must still reward understanding, if the player extracted a useful lesson.

## 13. Reward Model

The game rewards learning and team building.

### 13.1 Persistent Rewards

- `Agent XP`
- `Bond`
- `Confidence ceiling`
- `Memory Cards`
- `Doctrine unlock progress`
- `Artifact drops`
- `Scenario mastery`

### 13.2 Memory Card Types

- `Support Respect`
- `Failed Breakout`
- `Trap Avoidance`
- `Late Entry Punishment`
- `Momentum Confirmation`
- `Range Patience`

These are not lore collectibles.
They are training assets that affect future matches.

## 14. UI and UX Contract

### 14.1 Required Battlefield UI

- chart background with visible historical structure
- active battle slice emphasis
- player avatar and 3 companions
- current commitment marker
- rival pressure indicator
- objective meter
- HP and confidence displays
- companion role indicators
- event log
- reflection summary after match

### 14.2 Layout Rule

- the chart must remain readable as a chart first
- combat overlays must feel like tactical instrumentation on top of the chart
- old commitment markers should fade, not disappear
- the player should see both present tension and historical context at once

### 14.3 Visual Priority

Priority from highest to lowest:

1. current commitment and danger
2. player avatar and companions
3. active structures in the battle slice
4. objective and health feedback
5. historical background chart
6. secondary particles and decorative effects

## 15. MVP Definition

MVP battlefield should support:

- one coin chart at a time
- visible historical chart backdrop
- active combat slice on top of it
- player avatar plus 3 companions
- long, short, and hold
- support, resistance, breakout, and liquidation zone types
- one short clash loop
- one reflection and memory reward loop

MVP does not need:

- live market sync
- full open-world exploration
- fully autonomous companions
- dozens of companion classes
- deep economy or gacha systems

## 16. Acceptance Criteria

This rulebook is correctly implemented when a new player can look at a battle scene and immediately understand:

- which part of the chart is the current combat zone
- whether a long or short was just committed
- whether the team is attacking upward or being forced downward
- what each of the 3 companions is helping with
- whether the result was a good read, bad read, trap, or breakthrough

If the player only sees "RPG units over a finance background," the implementation has failed.

## Raising surface
Source: `docs/product-specs/raising.md`

# Surface Spec: raising

- Status: proposed
- Canonical route entry: `/roster`
- Surface ID: `raising`

## Purpose
`raising` is the player-facing surface family that makes each agent feel like a named companion the player is actively raising, not a config row in a tool.

It must let the player:

- form attachment to individual agents quickly
- understand how an agent is changing over time
- perform one meaningful training action in a few interactions
- see that training show up in the next battle and reflection
- see visible character change, not only hidden stat change
- keep the chart-native battle fantasy intact

If `raising` feels like a pet widget, a spreadsheet editor, or a disconnected monster box, this surface has failed.

## Problem

The current Cogochi thesis is clear about training and reflection, but the emotional ownership loop needs a stronger player-facing shape.

Without a dedicated raising surface, the player risks seeing agents as:

- prompt presets
- stat bundles
- abstract battle units

That would break the trainer fantasy.

Cogochi needs a surface where the player can feel:

- "this is my agent"
- "I trained it this way"
- "it behaved differently because of that training"

## Primary Persona

- Role: crypto-native player who already spends time around charts and wants attachment plus skill growth
- JTBD: "When I revisit a chart scenario, I want to raise my agents like a traveling squad, so that I care about them and can improve their judgment over repeated runs."
- Current alternatives:
  - chart tools with no attachment loop
  - pet or monster games with no market-judgment meaning
  - autobattlers where training choices are shallow or hidden
- Why those fail:
  - chart tools feel sterile
  - pet sims do not improve judgment
  - autobattlers do not explain why an agent changed

## One-Line Definition

Cogochi `raising` is the trainer surface where the player names, tunes, bonds with, and grows pixel companions whose memory and doctrine changes become visible in the next chart battle.

## Core Outcome

After one short session, the player should be able to say:

- who this agent is
- what changed during training
- why that change matters in battle
- what to improve next

## Interaction Principles

- Attachment before depth: the player should care about the agent before reading advanced systems.
- One clear action per visit: each screen should funnel toward one meaningful training decision.
- Visible cause and effect: every training action should preview a likely battlefield consequence.
- Growth must materialize on the body: training should alter stance, accessory, mark, or keepsake state.
- Party over inventory: the active team should feel like companions traveling together, not stored units.
- Cozy but not passive: warmth and charm are allowed, but the surface must still prepare the player for judgment and battle.

## Meaningful Progression Model

The player should not only raise `power`.
The player should raise a companion whose judgment and identity become more distinct.

The minimum progression stack is:

1. `Loadout growth`
   - indicator, script, doctrine, memory emphasis, and risk style change capability
2. `Body growth`
   - sprite stance, accessory, aura, mark, or keepsake state changes visibly
3. `History growth`
   - memorable runs leave lesson ribbons, scars, badges, or notes behind
4. `Care pressure`
   - stale memory, blurred doctrine, shaken confidence, or squad friction create a meaningful next maintenance action

If progression only changes hidden evaluation numbers, attachment will collapse.
If progression only changes cosmetics, the training platform will feel fake.

## Transformation States

Each agent should move through readable, non-random growth states:

- `Fresh`
  - new or lightly trained
- `Tuned`
  - one doctrine or scenario tendency is starting to show
- `Specialized`
  - repeated proof has given the agent a clear battle identity
- `Signature`
  - the agent now carries visible keepsakes and a recognizable style that reflects the trainer's pattern

These states should be driven by repeated judged behavior, not arbitrary level milestones.

## Care Loop

Cogochi should borrow `come back and care` energy from tamagotchi, but use judgment-native maintenance instead of chores.

Care states:

- `memory drift`
- `doctrine blur`
- `confidence shake`
- `squad friction`

Care actions:

- `curate memory`
- `rewrite doctrine`
- `spar on a safe scenario`
- `restabilize role fit`

The player should leave a failed run with one clear care action, not just a lower score.

## Happy Path

1. The player lands on `/` or `/roster` and immediately sees the active party as named pixel companions with visible mood, role, and recent growth.
2. The player opens one agent card and reads a compact identity panel: role, bond, doctrine tendency, last lesson, and current training focus.
3. The player chooses one training verb such as `tune doctrine`, `curate memory`, `bind data`, or `spar`.
4. The surface previews what will likely improve, what tradeoff is introduced, and which upcoming scenario fit changes.
5. The player confirms the training action and sees a small but emotionally satisfying change in the agent card, portrait, sprite state, or journal trace.
6. The player runs the next battle and sees the companion express the trained tendency on the chart stage.
7. The result screen writes back a lesson and suggests one next raising action.

## Key Screens

### `/roster`

Purpose:
show the full raising stable as a living party, not a storage box

Must communicate:

- each agent's name and pixel identity
- role and specialization
- bond level
- current training focus
- current growth state
- visible keepsake or appearance change
- recent lesson or mood tag
- whether the agent is in the active squad

Core action:
select one agent to inspect or one swap for the active party

### `/agent/[id]`

Purpose:
make one agent feel deeply owned and legible

Must communicate:

- portrait or bust-scale pixel sprite
- who the agent is
- what it remembers
- how it tends to behave
- what just changed
- which growth state or visible mutation it is in
- which keepsakes or field marks it has earned
- which training action is most relevant now

Core action:
choose the next training action for this specific agent

### `/lab`

Purpose:
execute explicit raising actions with visible tradeoffs

Must communicate:

- training verbs
- projected effects
- cost or cooldown
- recent experiments
- visible transformation preview
- next recommended scenario fit

Core action:
commit one training change and return to squad prep

### `/team`

Purpose:
make the four-slot squad feel like a bonded travel party

Must communicate:

- current role slots
- synergy and coverage
- weak matchups
- companion chemistry and scenario fit
- whether the team looks like a traveled squad instead of four unrelated units

Core action:
lock the party for the next battle

## Must Have

- Each agent has a stable visual identity with name, role, and readable sprite silhouette.
- The raising surfaces show bond, training focus, and recent lesson without forcing deep menus.
- The raising surfaces show at least one visible body or keepsake change tied to training progress.
- The player can perform one meaningful training action in three interactions or fewer.
- Training previews explain a likely battle consequence in player language.
- The active party feels like companions traveling together across surfaces.
- The next battle or scenario entry is always reachable from the raising flow.
- Reflection after battle points back to a specific raising action.
- A failed run surfaces one care action such as memory curation or doctrine repair.

## Should Have

- Tiny sprite-state changes after training, such as stance, accessory, badge, or aura cue.
- A journal-like lesson ribbon per agent.
- Party idle scenes where companions subtly animate together.
- A "best next training action" recommendation based on the last battle.
- Lightweight keepsakes such as ribbons, marks, or field notes that record memorable runs.
- Growth-state titles such as `Fresh`, `Tuned`, `Specialized`, or `Signature`.

## Won't Have In v1

- wild capture loop
- open-world town traversal as the main loop
- random evolution trees disconnected from judgment quality
- gacha acquisition
- breeding systems
- idle tamagotchi care meters
- long chore loops before battle entry
- meaningless XP bars with no visible or behavioral consequence

## Non-Goals

- turning Cogochi into a pure monster battler
- hiding training behind passive auto-progression
- reducing agents to cute mascots with no doctrine or memory meaning
- replacing the chart battle with a detached overworld RPG
- imitating Pokemon structure so closely that chart-native judgment stops mattering

## Done Means

- A new player forms attachment to at least one agent in under a minute.
- The player can explain one difference between two agents without reading internal config language.
- One completed training action clearly suggests a battle consequence.
- The player can point to one visible change on the companion after a meaningful training or battle cycle.
- The active party is readable as a bonded squad rather than a list of slots.
- The raising flow feeds naturally into battle and reflection instead of competing with them.

## Context Contracts

### Routes

- `/roster`
  - roster browsing, active squad inclusion, quick raising summary
- `/agent/[id]`
  - identity, memory, doctrine tendency, recent lesson, next action
- `/lab`
  - training verbs, preview, confirmation, recent experiments
- `/team`
  - party composition and scenario fit
- supporting route:
  - `/battle`

### Stores

- `rosterStore`
  - agent identity, roster membership, last lesson, progression summary
- `labStore`
  - training actions, preview state, experiment history
- `squadStore`
  - active party selection, slot fit, synergy state
- `matchStore`
  - scenario relevance, last result, battle follow-through

### Dependencies On Other Specs

- `raising` depends on `core` for trainer hub entry and session continuity.
- `raising` depends on the battle layer to prove training effects.
- `raising` must stay consistent with `docs/VISUAL_WORLD_DESIGN.md` companion feel rules.

## Deep Links

- `docs/product-specs/core.md`
- `docs/MASTER_GAME_SPEC.md`
- `docs/AGENT_SYSTEM_DESIGN.md`
- `docs/BATTLEFIELD_DESIGN.md`
- `docs/VISUAL_WORLD_DESIGN.md`
- `docs/design-docs/pixel-agent-raising-direction.md`
- `docs/design-docs/judgment-tamagotchi-loop.md`

## Field surface
Source: `docs/product-specs/field.md`

# Surface Spec: field

- Status: proposed
- Canonical route entry: `/field`
- Surface ID: `field`

## Purpose

`field` is the surface family that makes Cogochi feel like a real web game instead of a set of disconnected management screens.

It must let the player:

- move through a chart-native top-down world
- travel with a four-slot squad
- see where the next clash is happening
- enter battle from the world instead of from a sterile menu
- return to camp with a new lesson and next care action

If `field` feels like a generic town map, a dead lobby, or a detached route hub, this surface has failed.

## Problem

The current runtime proves roster, lab, and battle ideas, but the loop still feels too menu-like.

Without a true field layer, the player does not get:

- travel attachment
- party presence
- calm-between-clashes pacing
- a satisfying return loop after battle

That blocks the product from feeling like a judgment RPG.

## Primary Persona

- Role: crypto-native player who wants a gameful training loop, not only a chart tool
- JTBD: "When I come back to train my agents, I want to walk my squad through a readable chart world, so that battles feel like destinations and my agents feel like companions."
- Current alternatives:
  - menu-heavy prototypes
  - cozy top-down RPGs with no judgment meaning
  - chart tools with no travel or squad fantasy
- Why those fail:
  - menu-heavy prototypes break immersion
  - cozy RPGs lose the chart-native thesis
  - chart tools have no party identity or session rhythm

## One-Line Definition

Cogochi `field` is the chart-world surface where the player leads a four-slot squad through a top-down market landscape, enters clash gates, and returns with reflection and care pressure.

## Core Outcome

After one short session, the player should be able to say:

- where their squad is going
- why this next chart clash matters
- what changed after the last battle
- what they should do next before re-entering the gate

## Interaction Principles

- Travel matters: battle should be approached, not teleported to by default.
- Chart-first terrain: the world must still read as transformed chart structure.
- Quiet exploration: the field should calm the player before the next clash.
- One clear destination: each visit should surface one best next objective.
- Squad presence over UI chrome: companions should do more emotional work than HUD elements.
- Return loop clarity: after battle, the player must know where to go to repair, tune, or re-enter.
- Runtime guidance stays in-world: the nightly distill and next proof pressure should point to a field node without forcing the player into `/journal` first.
- The next node should read as a beacon in the world, not only as a HUD sentence.

## Happy Path

1. The player enters `/field` at camp with the active squad already visible.
2. The field highlights one meaningful next destination such as the lab bench, archive well, or battle gate.
3. A runtime cue on the field names the next best repair or proof node after the latest return.
4. The player walks the squad through a compact chart-shaped path and sees companion follow behavior.
5. The player interacts with one care or training node if needed.
6. The player reaches the battle gate and enters a clash with clear terrain and objective cues.
7. The battle resolves and writes back a lesson, keepsake chance, and care state.
8. The player returns to camp or journal space and receives one recommended next action.

## Key Areas

### `Camp`

Purpose:
restore orientation and show squad state

### `Archive Well`

Purpose:
inspect or curate memory

### `Lab Bench`

Purpose:
edit doctrine, script, indicator, and risk

### `Battle Gate`

Purpose:
enter the next scenario from the world

### `Journal Board`

Purpose:
read the last lesson and next care action

## Must Have

- A top-down field route exists in app code.
- The active squad is visible as a four-slot travel party.
- Party members have readable follow behavior and role flavor.
- The field has at least one battle gate, one care/training node, and one return point.
- The chart shape remains visible in terrain height, walls, and hazard placement.
- Explore Mode and Clash Mode feel distinct but connected.
- The player can enter battle from the field and return with updated squad state.
- The field shows the next best destination without loud quest UI.
- The field consumes runtime distill output and turns it into a visible next-node cue on the HUD.
- The field consumes runtime distill output and turns it into a visible next-node beacon in world-space.

## Should Have

- Simple idle behavior at camp.
- A safe spar gate distinct from the main battle gate.
- Small world memories such as markers, flags, or shrines from prior runs.
- Leader swap or quick squad reorder.
- Soft day/night or scenario mood tinting.

## Won't Have In v1

- a large open world
- NPC quest chains
- random enemy swarms
- full action combat on the overworld
- jump puzzles or precision platforming
- crafting or inventory economy

## Non-Goals

- turning Cogochi into a generic cozy RPG
- hiding battle entry behind long travel chores
- replacing chart meaning with arbitrary fantasy terrain
- using the field as decoration while all real interaction stays in menus

## Done Means

- The player can travel with the squad in a real field route.
- The player can identify camp, care, and battle destinations without opening a separate menu.
- The field gives the session a calmer rhythm before and after clashes.
- Entering battle from the field feels more meaningful than launching it from a dropdown.
- The field writes back to roster, care, and reflection instead of acting like a dead wrapper.
- The player can see the next repair or proof target directly from the field after returning from a clash.

## Context Contracts

### Routes

- `/field`
  - top-down travel, interact nodes, battle gate entry, return loop
- depends on:
  - `/roster`
  - `/agent/[id]`
  - `/lab`
  - `/battle`

### Stores

- `rosterStore`
  - active squad, growth state, visible changes
- `labStore`
  - next training edits and care actions
- `battleStore`
  - current clash entry and result return
- future likely store:
  - `fieldStore`

### Dependencies On Other Specs

- `field` depends on `core` for session framing.
- `field` depends on `raising` for squad attachment and care meaning.
- `field` depends on `docs/BATTLEFIELD_DESIGN.md` and `docs/VISUAL_WORLD_DESIGN.md` for chart-to-world translation.

## Deep Links

- `docs/product-specs/core.md`
- `docs/product-specs/raising.md`
- `docs/BATTLEFIELD_DESIGN.md`
- `docs/VISUAL_WORLD_DESIGN.md`
- `docs/design-docs/chartfield-fullgame-direction.md`
- `docs/design-docs/judgment-tamagotchi-loop.md`

## Battle surface
Source: `docs/product-specs/battle.md`

# Surface Spec: battle

- Status: active
- Canonical route entry: `/battle`
- Surface ID: `battle`

## Purpose

`battle` is the chart-native clash surface where one historical frame becomes one short, readable objective.

It must let the player:

- enter from the field or lab with a clear reason
- read one objective quickly
- see one short entry brief that explains why this clash matters right now
- use a bounded command set
- understand why the captain chose the final line
- leave with a verdict that changes the agent

If `battle` feels like a report viewer, a finance dashboard, or a detached tactics minigame, it has failed.

## Core Outcome

After one clash, the player should be able to say:

- what the objective was
- why the squad won or lost
- which instinct was weak
- what mutation verdict they chose

## Must Have

- one obvious clash objective
- clear field or lab entry reason
- one entry brief tied to gate pressure or care-state repair
- visible chart terrain and active proof frame
- readable support versus objection explanation
- keep, quarantine, or revert before return
- writeback into trust, mutation history, proven frame, and memory
- direct handoff into `/journal` after verdict so the return loop does not collapse into a raw field jump
- runtime-derived focus checks may appear in the entry brief, but only as advisory guidance and never as battle authority

## Context Contracts

## Routes

- `/battle`

## Stores

- `battleStore`
- `rosterStore`

## Deep Links

- `docs/BATTLEFIELD_DESIGN.md`
- `docs/design-docs/atlas-judgment-evolution.md`
- `docs/product-specs/evolution.md`

## Journal surface
Source: `docs/product-specs/journal.md`

# Surface Spec: journal

- Status: active
- Canonical route entry: `/journal`
- Surface ID: `journal`

## Purpose

`journal` is the return-pressure surface that turns a finished proof run into one obvious next action.

It must let the player:

- see the latest accepted, reverted, or quarantined mutation
- see which historical frame shaped the current body
- understand current care pressure
- choose the next repair, spar, or proof step

If `journal` feels like a dump of logs instead of a compelling return point, it has failed.

## Core Outcome

After opening `/journal`, the player should immediately know:

- what just happened
- what changed on the creature
- what to do next

## Must Have

- latest mutation and frame surfaced first
- current care action above older history
- direct links back to lab, field, and battle
- visible trust and body-change story
- runtime distill guidance surfaced as an advisory rail
- memory index tiers translated into one obvious next repair or proof step

## Context Contracts

## Routes

- `/journal`

## Stores

- `rosterStore`
- `labStore`

## Deep Links

- `docs/product-specs/evolution.md`
- `docs/design-docs/judgment-tamagotchi-loop.md`
- `docs/exec-plans/active/COGOCHI_pokemon_grade_autoresearch_20260313.md`

