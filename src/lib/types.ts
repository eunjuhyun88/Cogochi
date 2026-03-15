export type AgentRole = 'SCOUT' | 'ANALYST' | 'RISK' | 'EXECUTOR';
export type AgentFamily = 'DINO' | 'COGLET';
export type ConfidenceStyle = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
export type Horizon = 'SCALP' | 'INTRADAY' | 'SWING';
export type DataSourceKind = 'PRICE' | 'NEWS' | 'ONCHAIN' | 'SOCIAL' | 'USER_NOTE' | 'MACRO';
export type ToolKind = 'RETRIEVER' | 'SUMMARIZER' | 'SCORER' | 'RISK_FILTER';
export type MemoryBias = 'FAILURES' | 'PLAYBOOKS' | 'WINS';
export type MemoryTier = 'M0' | 'M30' | 'M90' | 'M365';
export type MemorySource = 'SEED' | 'TRAINING' | 'BATTLE' | 'DISTILL';
export type IndicatorPresetId = 'TREND_RIBBON' | 'STRUCTURE_MAP' | 'LIQUIDITY_LENS';
export type ScriptPresetId = 'BREAKOUT_CONFIRM' | 'SUPPORT_DEFEND' | 'TRAP_FADE';
export type EvalAction = 'LONG' | 'SHORT' | 'HOLD';
export type GrowthStage = 'FRESH' | 'TUNED' | 'SPECIALIZED' | 'SIGNATURE';
export type CareState = 'CLEAR' | 'MEMORY_DRIFT' | 'DOCTRINE_BLUR' | 'CONFIDENCE_SHAKE' | 'SQUAD_FRICTION';
export type MutationGene = 'DOCTRINE' | 'INDICATOR' | 'SCRIPT' | 'MEMORY' | 'RISK' | 'COORDINATION';
export type MutationDecision = 'ACCEPTED' | 'REVERTED' | 'QUARANTINED';
export type InstinctState = 'TRUSTED' | 'WATCH' | 'WEAK';
export type BattleTone = 'good' | 'info' | 'warn' | 'danger';
export type BattlePhaseId = 'APPROACH' | 'LOCK' | 'COMMIT' | 'RESOLVE';
export type BattleOutcome = 'ONGOING' | 'WIN' | 'LOSS';
export type BattleCommandId = 'FOCUS_TAP' | 'MEMORY_PULSE' | 'RISK_VETO' | 'RETARGET';
export type BattleEntryGate = 'DIRECT' | 'SPAR' | 'PROOF';
export type ProofMode = 'SPAR' | 'PROOF' | 'GAUNTLET';
export type ProofMetricId =
  | 'READ_ACCURACY'
  | 'RISK_DISCIPLINE'
  | 'TRAP_AVOIDANCE'
  | 'RETRIEVAL_QUALITY'
  | 'EXPLANATION_CONSISTENCY'
  | 'SQUAD_COORDINATION'
  | 'SHADOW_RETURN';
export type FieldNodeKind = 'CAMP' | 'LAB' | 'ARCHIVE' | 'JOURNAL' | 'BATTLE_GATE';
export type FieldFacing = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type DoctrinePatternId = 'OI_SPIKE' | 'CVD_DIVERGENCE' | 'FUNDING_HEAT' | 'DISTRIBUTION_ZONE' | 'CUSTOM';
export type OverlayLayerKind = 'BADGE' | 'ZONE' | 'MARKER' | 'BAND';
export type OverlayTone = 'BULL' | 'BEAR' | 'WARN' | 'INFO' | 'NEUTRAL';
export type DoctrineSessionStatus = 'DRAFT' | 'BOUND' | 'KEPT' | 'QUARANTINED' | 'REVERTED';
export type PassportPublishStatus = 'DRAFT' | 'PUBLISHED';

export interface TrainingLoadout {
  systemPrompt: string;
  rolePrompt: string;
  policyPrompt: string;
  enabledDataSourceKinds: DataSourceKind[];
  enabledToolKinds: ToolKind[];
  riskTolerance: number;
  confidenceStyle: ConfidenceStyle;
  horizon: Horizon;
  indicatorPresetId: IndicatorPresetId;
  scriptPresetId: ScriptPresetId;
  memoryBias: MemoryBias;
  doctrineNote: string;
}

export interface OverlaySpecLayer {
  id: string;
  kind: OverlayLayerKind;
  label: string;
  tone: OverlayTone;
  rule: string;
  detail: string;
}

export interface OverlaySpec {
  id: string;
  title: string;
  summary: string;
  layers: OverlaySpecLayer[];
}

export interface PineDraft {
  id: string;
  title: string;
  code: string;
  notes: string[];
}

export interface DoctrineEvidenceFrame {
  id: string;
  title: string;
  dateLabel: string;
  note: string;
}

export interface DoctrineTerminalResult {
  id: string;
  title: string;
  patternId: DoctrinePatternId;
  userPrompt: string;
  normalizedIntent: string;
  recommendedProofPackId: string | null;
  criteriaSummary: string[];
  explanation: string[];
  overlaySpec: OverlaySpec;
  pineDraft: PineDraft | null;
  evidenceFrames: DoctrineEvidenceFrame[];
  suggestedLoadout: Partial<TrainingLoadout>;
}

export interface DoctrineSession extends DoctrineTerminalResult {
  agentId: string;
  status: DoctrineSessionStatus;
  createdAt: number;
}

export interface TrainingRun {
  id: string;
  agentId: string;
  scenarioId: string;
  createdAt: number;
  summary: string;
  deltaTotal: number;
}

export interface EvalScenario {
  id: string;
  label: string;
  symbol: string;
  timeframe: string;
  objective: string;
  terrain: string;
  structureHint: string;
  targetAction: EvalAction;
  preferredIndicator: IndicatorPresetId;
  preferredScript: ScriptPresetId;
  preferredMemoryBias: MemoryBias;
  preferredHorizon: Horizon;
  idealRiskTolerance: number;
  preferredConfidenceStyle: ConfidenceStyle;
}

export interface EvalReport {
  scenarioId: string;
  action: EvalAction;
  confidence: number;
  accuracyScore: number;
  reasoningScore: number;
  riskScore: number;
  coordinationScore: number;
  calibrationScore: number;
  retrievalScore: number;
  totalScore: number;
  battleRead: string;
  retrievalRead: string;
  trustedInstincts: AgentInstinct[];
  weakLink: string;
  weakLinkGene: MutationGene;
  captainCall: string;
  objection: string;
  proofFrameId: string;
  proofFrameTitle: string;
  proofFrameDateLabel: string;
}

export interface EvalComparison {
  scenario: EvalScenario;
  current: EvalReport;
  proposed: EvalReport;
  deltas: {
    totalScore: number;
    accuracyScore: number;
    reasoningScore: number;
    riskScore: number;
    coordinationScore: number;
    calibrationScore: number;
    retrievalScore: number;
  };
  decision: MutationDecision;
  decisionReason: string;
  visibleEffect: string;
  summary: string;
}

export interface AgentMemoryCard {
  id: string;
  type: 'FAILURE_CASE' | 'SUCCESS_CASE' | 'PLAYBOOK' | 'USER_NOTE';
  title: string;
  note: string;
  tier?: MemoryTier;
  source?: MemorySource;
  createdAt?: number;
}

export interface AgentInstinct {
  id: string;
  label: string;
  gene: MutationGene;
  weight: number;
  state: InstinctState;
}

export interface ProvenFrame {
  id: string;
  title: string;
  dateLabel: string;
  note: string;
  result: 'PASSED' | 'FAILED' | 'UNSTABLE';
}

export interface AgentMutation {
  id: string;
  title: string;
  gene: MutationGene;
  decision: MutationDecision;
  reason: string;
  proofFrameId: string;
  proofFrameTitle: string;
  visibleEffect: string;
  deltaTotal: number;
  createdAt: number;
}

export interface OwnedAgent {
  id: string;
  name: string;
  baseModelId: string;
  baseModelLabel: string;
  family: AgentFamily;
  role: AgentRole;
  spriteSheet: string;
  spriteFrameCount: number;
  spriteFrameIndex: number;
  bond: number;
  level: number;
  trustWeight: number;
  growthStage: GrowthStage;
  keepsakes: string[];
  careState: CareState;
  nextCareAction: string;
  recentLesson: string;
  recentTrainingFocus: string;
  trustedInstincts: AgentInstinct[];
  weakLink: string;
  provenFrames: ProvenFrame[];
  mutations: AgentMutation[];
  status: 'READY' | 'TRAINING' | 'IN_REVIEW';
  memoryBank: AgentMemoryCard[];
  loadout: TrainingLoadout;
  trainingHistory: TrainingRun[];
  lastComparison: EvalComparison | null;
}

export interface RosterState {
  agents: OwnedAgent[];
  selectedAgentId: string;
  recentComparisons: EvalComparison[];
}

export interface LabState {
  activeAgentId: string;
  activeScenarioId: string;
  drafts: Record<string, TrainingLoadout>;
  doctrineSessions: Record<string, DoctrineSession[]>;
  activeDoctrineSessionIds: Record<string, string>;
}

export interface TrainerSummary {
  trainerName: string;
  activeScenarioId: string;
  streakLabel: string;
  focus: string;
}

export interface BattleTurnLog {
  id: string;
  turn: number;
  commandId: BattleCommandId | null;
  title: string;
  summary: string;
  tone: BattleTone;
}

export interface BattleSession {
  agentId: string;
  scenarioId: string;
  entryFrameId: string | null;
  entryGate: BattleEntryGate;
  doctrineSessionId: string | null;
  doctrineSessionTitle: string | null;
  doctrineSessionPackId: string | null;
  proofArtifactId: string | null;
  turnLimit: number;
  writebackApplied: boolean;
  turn: number;
  phase: BattlePhaseId;
  outcome: BattleOutcome;
  selectedCommandId: BattleCommandId;
  lastCommandId: BattleCommandId | null;
  structureIntegrity: number;
  supportIntegrity: number;
  trapRisk: number;
  pushMomentum: number;
  rivalPressure: number;
  focusCharge: number;
  revealLevel: number;
  logs: BattleTurnLog[];
}

export interface BattleState {
  session: BattleSession | null;
}

export interface ProofArtifact {
  id: string;
  agentId: string;
  agentName: string;
  scenarioId: string;
  frameId: string | null;
  frameTitle: string;
  frameDateLabel: string | null;
  entryGate: BattleEntryGate;
  proofPackId: string | null;
  proofPackTitle: string | null;
  doctrineSessionId: string | null;
  doctrineTitle: string | null;
  doctrineNormalizedIntent: string | null;
  criteriaSummary: string[];
  overlaySpec: OverlaySpec | null;
  battleOutcome: BattleOutcome;
  trainerVerdict: MutationDecision;
  mutationId: string;
  mutationTitle: string;
  mutationReason: string;
  visibleEffect: string;
  trustBefore: number;
  trustAfter: number;
  trustDelta: number;
  growthStageBefore: GrowthStage;
  growthStageAfter: GrowthStage;
  careStateAfter: CareState;
  createdAt: number;
}

export interface ProofState {
  artifacts: ProofArtifact[];
  activeArtifactId: string | null;
}

export interface ProofArtifactView {
  artifact: ProofArtifact;
  publicReady: boolean;
  proofMode: ProofMode | null;
}

export interface ProofPassportSummary {
  agentId: string;
  totalArtifacts: number;
  acceptedArtifacts: number;
  publicArtifacts: number;
  acceptedPublicArtifacts: number;
  averageTrustDelta: number;
  latestArtifact: ProofArtifactView | null;
  latestPublicArtifact: ProofArtifactView | null;
}

export interface PublicProofArtifact {
  id: string;
  mutationTitle: string;
  mutationReason: string;
  visibleEffect: string;
  frameTitle: string;
  frameDateLabel: string | null;
  proofPackId: string | null;
  proofPackTitle: string | null;
  proofMode: ProofMode | null;
  doctrineTitle: string | null;
  criteriaSummary: string[];
  battleOutcome: BattleOutcome;
  trainerVerdict: MutationDecision;
  trustDelta: number;
  growthStageAfter: GrowthStage;
  careStateAfter: CareState;
  entryGate: BattleEntryGate;
  createdAt: number;
}

export interface PassportSnapshotInput {
  agentId: string;
  agentName: string;
  role: AgentRole;
  baseModelLabel: string;
  growthStage: GrowthStage;
  trustWeight: number;
  weakLink: string;
  recentLesson: string;
  publicArtifacts: PublicProofArtifact[];
}

export interface PassportSnapshot extends PassportSnapshotInput {
  slug: string;
  exportedAt: string;
  acceptedPublicArtifacts: number;
  latestPublicArtifact: PublicProofArtifact | null;
  publishStatus: PassportPublishStatus;
  publishedAt: string | null;
}

export interface ProofCase {
  id: string;
  frameId: string;
  frameTitle: string;
  frameDateLabel: string;
  scenarioId: EvalScenario['id'];
  objective: string;
  note: string;
}

export interface ProofMetricWeight {
  id: ProofMetricId;
  weight: number;
}

export interface ProofPack {
  id: string;
  title: string;
  mode: ProofMode;
  summary: string;
  targetWeakLinks: MutationGene[];
  recommendedGate: Extract<BattleEntryGate, 'SPAR' | 'PROOF'>;
  publicReady: boolean;
  cases: ProofCase[];
  metricWeights: ProofMetricWeight[];
}

export interface FieldNode {
  id: string;
  kind: FieldNodeKind;
  label: string;
  description: string;
  x: number;
  y: number;
  href?: string;
}

export interface FieldPartyMemberState {
  agentId: string;
  x: number;
  y: number;
  facing: FieldFacing;
  frameIndex: number;
  moving: boolean;
  isLeader: boolean;
}

export interface FieldState {
  width: number;
  height: number;
  partyAgentIds: string[];
  members: FieldPartyMemberState[];
  nearbyNodeId: string | null;
  objectiveNodeId: string;
  lastEvent: string;
  canInteract: boolean;
  tick: number;
}
