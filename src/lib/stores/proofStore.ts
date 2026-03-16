import { get } from 'svelte/store';
import { getProofPack } from '$lib/engine/proof-system';
import { persistedWritable } from '$lib/stores/persisted';
import type {
  OwnedAgent,
  PassportSnapshotInput,
  ProofArtifact,
  ProofArtifactView,
  ProofPassportSummary,
  ProofState,
  PublicProofArtifact,
} from '$lib/types';

const initialState: ProofState = {
  artifacts: [],
  activeArtifactId: null,
};

const MAX_ARTIFACT_HISTORY = 48;

function makeArtifactId(agentId: string): string {
  return `${agentId}-proof-${Date.now()}`;
}

function cloneArtifact(artifact: ProofArtifact): ProofArtifact {
  return {
    ...artifact,
    criteriaSummary: [...artifact.criteriaSummary],
    overlaySpec: artifact.overlaySpec
      ? {
          ...artifact.overlaySpec,
          layers: artifact.overlaySpec.layers.map((layer) => ({ ...layer })),
        }
      : null,
  };
}

function sortArtifactsDesc(a: ProofArtifact, b: ProofArtifact): number {
  return b.createdAt - a.createdAt;
}

function buildArtifactView(artifact: ProofArtifact): ProofArtifactView {
  const pack = getProofPack(artifact.proofPackId);
  return {
    artifact: cloneArtifact(artifact),
    publicReady: pack?.publicReady ?? false,
    proofMode: pack?.mode ?? null,
  };
}

function getArtifactViewsForAgent(state: ProofState, agentId: string): ProofArtifactView[] {
  return state.artifacts.filter((artifact) => artifact.agentId === agentId).sort(sortArtifactsDesc).map(buildArtifactView);
}

function buildPassportSummary(state: ProofState, agentId: string): ProofPassportSummary {
  const artifacts = getArtifactViewsForAgent(state, agentId);
  const publicArtifacts = artifacts.filter((entry) => entry.publicReady);
  const acceptedArtifacts = artifacts.filter((entry) => entry.artifact.trainerVerdict === 'ACCEPTED');
  const acceptedPublicArtifacts = publicArtifacts.filter((entry) => entry.artifact.trainerVerdict === 'ACCEPTED');
  const averageTrustDelta = artifacts.length
    ? Number((artifacts.reduce((sum, entry) => sum + entry.artifact.trustDelta, 0) / artifacts.length).toFixed(1))
    : 0;

  return {
    agentId,
    totalArtifacts: artifacts.length,
    acceptedArtifacts: acceptedArtifacts.length,
    publicArtifacts: publicArtifacts.length,
    acceptedPublicArtifacts: acceptedPublicArtifacts.length,
    averageTrustDelta,
    latestArtifact: artifacts[0] ?? null,
    latestPublicArtifact: publicArtifacts[0] ?? null,
  };
}

function getRecentPublicArtifactViews(state: ProofState, limit: number): ProofArtifactView[] {
  return state.artifacts
    .slice()
    .sort(sortArtifactsDesc)
    .map(buildArtifactView)
    .filter((entry) => entry.publicReady)
    .slice(0, limit);
}

function toPublicArtifact(entry: ProofArtifactView): PublicProofArtifact {
  return {
    id: entry.artifact.id,
    mutationTitle: entry.artifact.mutationTitle,
    mutationReason: entry.artifact.mutationReason,
    visibleEffect: entry.artifact.visibleEffect,
    frameTitle: entry.artifact.frameTitle,
    frameDateLabel: entry.artifact.frameDateLabel,
    proofPackId: entry.artifact.proofPackId,
    proofPackTitle: entry.artifact.proofPackTitle,
    proofMode: entry.proofMode,
    doctrineTitle: entry.artifact.doctrineTitle,
    criteriaSummary: [...entry.artifact.criteriaSummary],
    battleOutcome: entry.artifact.battleOutcome,
    trainerVerdict: entry.artifact.trainerVerdict,
    trustDelta: entry.artifact.trustDelta,
    growthStageAfter: entry.artifact.growthStageAfter,
    careStateAfter: entry.artifact.careStateAfter,
    entryGate: entry.artifact.entryGate,
    createdAt: entry.artifact.createdAt,
  };
}

function createProofStore() {
  const store = persistedWritable<ProofState>('cogochi.proof.v1', initialState);
  const { subscribe, update } = store;

  return {
    subscribe,
    getActiveArtifact(): ProofArtifact | null {
      const state = get(store);
      const artifact = state.activeArtifactId ? state.artifacts.find((entry) => entry.id === state.activeArtifactId) : null;
      return artifact ? cloneArtifact(artifact) : null;
    },
    getArtifact(artifactId: string): ProofArtifact | null {
      const artifact = get(store).artifacts.find((entry) => entry.id === artifactId);
      return artifact ? cloneArtifact(artifact) : null;
    },
    getArtifactsForAgent(agentId: string): ProofArtifactView[] {
      return getArtifactViewsForAgent(get(store), agentId);
    },
    getPublicArtifactsForAgent(agentId: string): ProofArtifactView[] {
      return getArtifactViewsForAgent(get(store), agentId).filter((entry) => entry.publicReady);
    },
    getPassportSummary(agentId: string): ProofPassportSummary {
      return buildPassportSummary(get(store), agentId);
    },
    getRecentPublicArtifacts(limit = 6): ProofArtifactView[] {
      return getRecentPublicArtifactViews(get(store), limit);
    },
    getPassportSnapshotInput(agent: OwnedAgent): PassportSnapshotInput {
      const publicArtifacts = getArtifactViewsForAgent(get(store), agent.id)
        .filter((entry) => entry.publicReady)
        .map(toPublicArtifact);

      return {
        agentId: agent.id,
        agentName: agent.name,
        role: agent.role,
        baseModelLabel: agent.baseModelLabel,
        growthStage: agent.growthStage,
        trustWeight: agent.trustWeight,
        weakLink: agent.weakLink,
        recentLesson: agent.recentLesson,
        publicArtifacts,
      };
    },
    recordArtifact(input: Omit<ProofArtifact, 'id' | 'createdAt'>): ProofArtifact {
      const artifact: ProofArtifact = {
        ...input,
        id: makeArtifactId(input.agentId),
        createdAt: Date.now(),
      };

      update((state) => ({
        activeArtifactId: artifact.id,
        artifacts: [artifact, ...state.artifacts.filter((entry) => entry.id !== artifact.id)].slice(0, MAX_ARTIFACT_HISTORY),
      }));

      return artifact;
    },
    setActiveArtifact(artifactId: string) {
      update((state) => ({
        ...state,
        activeArtifactId: artifactId,
      }));
    },
  };
}

export const proofStore = createProofStore();
