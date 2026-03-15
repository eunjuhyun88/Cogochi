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
