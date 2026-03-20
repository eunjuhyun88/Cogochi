import { get, writable } from 'svelte/store';
import {
  createInitialFieldRunStats,
  executeFieldCommand,
  restFieldRun,
  syncFieldEncounter,
} from '$lib/engine/field-encounter';
import type { FieldCommandId, FieldFacing, FieldNode, FieldPartyMemberState, FieldState, OwnedAgent } from '$lib/types';

const FIELD_WIDTH = 2736;
const FIELD_HEIGHT = 1620;
const LEADER_SPEED = 224;
const RUN_SPEED = 332;
const FOLLOW_SPEED = 248;
const FOLLOW_SPACING = 42;
const INTERACT_RADIUS = 80;
const COLLISION_RADIUS = 20;

type InputState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
};

type FieldBarrier = {
  id: string;
  kind: 'wall' | 'pit' | 'support' | 'resistance';
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
};

export const fieldNodes: FieldNode[] = [
  {
    id: 'camp',
    kind: 'CAMP',
    label: 'Camp',
    description: 'Catch breath, check the squad, and reset after a clash.',
    x: 556,
    y: 1272,
  },
  {
    id: 'lab-bench',
    kind: 'LAB',
    label: 'Lab Bench',
    description: 'Tune doctrine, script, indicator, and risk before the next gate.',
    x: 1264,
    y: 1022,
    href: '/lab',
  },
  {
    id: 'journal-board',
    kind: 'JOURNAL',
    label: 'Journal Board',
    description: 'Read the last verdict, proven frame, and the next care action.',
    x: 872,
    y: 1168,
    href: '/journal',
  },
  {
    id: 'archive-well',
    kind: 'ARCHIVE',
    label: 'Archive Well',
    description: 'Inspect one agent and curate what it remembers.',
    x: 1716,
    y: 706,
    href: '/roster',
  },
  {
    id: 'spar-gate',
    kind: 'BATTLE_GATE',
    label: 'Spar Gate',
    description: 'Run a safer rehearsal loop before the proof gate.',
    x: 2068,
    y: 952,
    href: '/battle',
  },
  {
    id: 'battle-gate',
    kind: 'BATTLE_GATE',
    label: 'Battle Gate',
    description: 'Step into the chart slice and prove the current squad read.',
    x: 2360,
    y: 566,
    href: '/battle',
  },
];

export const fieldBarriers: FieldBarrier[] = [
  { id: 'trap-garden', kind: 'wall', x: 778, y: 384, width: 342, height: 168, label: 'Trap bloom' },
  { id: 'support-ledge', kind: 'support', x: 866, y: 1078, width: 464, height: 128, label: 'Support shelf' },
  { id: 'liq-pit', kind: 'pit', x: 1508, y: 930, width: 318, height: 248, label: 'Long liq pit' },
  { id: 'memory-wall', kind: 'wall', x: 1852, y: 502, width: 194, height: 218, label: 'Memory gate' },
  { id: 'resistance-wall', kind: 'resistance', x: 2218, y: 394, width: 212, height: 456, label: 'Resistance wall' },
  { id: 'pressure-pit', kind: 'pit', x: 1944, y: 1128, width: 254, height: 196, label: 'Pressure sink' },
];

const initialState: FieldState = {
  width: FIELD_WIDTH,
  height: FIELD_HEIGHT,
  partyAgentIds: [],
  members: [],
  nearbyNodeId: null,
  objectiveNodeId: 'spar-gate',
  lastEvent: 'Lead the dino squad toward the next gate.',
  canInteract: false,
  tick: 0,
  run: createInitialFieldRunStats(),
  encounter: null,
};

const spawnPoints = [
  { x: 608, y: 1276 },
  { x: 566, y: 1306 },
  { x: 520, y: 1270 },
  { x: 474, y: 1300 },
];

const inputState: InputState = {
  up: false,
  down: false,
  left: false,
  right: false,
  run: false,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

function animationFrame(tick: number, offset = 0): number {
  return Math.floor(tick / 120 + offset) % 4;
}

function detectBarrierCollision(x: number, y: number): boolean {
  return fieldBarriers.some((barrier) => {
    const nearestX = clamp(x, barrier.x, barrier.x + barrier.width);
    const nearestY = clamp(y, barrier.y, barrier.y + barrier.height);
    return distance(x, y, nearestX, nearestY) < COLLISION_RADIUS;
  });
}

function resolveAxis(x: number, y: number, delta: number, axis: 'x' | 'y'): number {
  const next = axis === 'x' ? x + delta : y + delta;
  const candidateX = axis === 'x' ? next : x;
  const candidateY = axis === 'y' ? next : y;
  if (!detectBarrierCollision(candidateX, candidateY)) {
    return next;
  }
  return axis === 'x' ? x : y;
}

function moveWithCollisions(member: FieldPartyMemberState, vx: number, vy: number): Pick<FieldPartyMemberState, 'x' | 'y'> {
  const nextX = clamp(resolveAxis(member.x, member.y, vx, 'x'), 48, FIELD_WIDTH - 48);
  const nextY = clamp(resolveAxis(nextX, member.y, vy, 'y'), 48, FIELD_HEIGHT - 48);
  return {
    x: nextX,
    y: nextY,
  };
}

function getFacing(vx: number, vy: number, fallback: FieldFacing): FieldFacing {
  if (Math.abs(vx) > Math.abs(vy)) {
    if (vx > 0) return 'RIGHT';
    if (vx < 0) return 'LEFT';
  }
  if (vy > 0) return 'DOWN';
  if (vy < 0) return 'UP';
  return fallback;
}

function makeMember(agentId: string, index: number): FieldPartyMemberState {
  const spawn = spawnPoints[index] ?? spawnPoints[spawnPoints.length - 1];
  return {
    agentId,
    x: spawn.x,
    y: spawn.y,
    facing: 'RIGHT',
    frameIndex: 0,
    moving: false,
    isLeader: index === 0,
  };
}

function findNearbyNode(member: FieldPartyMemberState): FieldNode | null {
  return fieldNodes.find((node) => distance(member.x, member.y, node.x, node.y) <= INTERACT_RADIUS) ?? null;
}

function createFieldStore() {
  const store = writable<FieldState>(initialState);
  const { subscribe, update } = store;

  return {
    subscribe,
    setParty(agents: OwnedAgent[]) {
      const partyAgentIds = agents.map((agent) => agent.id).slice(0, 4);
      update((state) => {
        const sameParty =
          state.partyAgentIds.length === partyAgentIds.length &&
          state.partyAgentIds.every((agentId, index) => agentId === partyAgentIds[index]);
        if (sameParty && state.members.length === partyAgentIds.length) {
          return state;
        }

        const members = partyAgentIds.map((agentId, index) => makeMember(agentId, index));
        const nearbyNode = members[0] ? findNearbyNode(members[0]) : null;
        return {
          ...state,
          partyAgentIds,
          members,
          nearbyNodeId: nearbyNode?.id ?? null,
          canInteract: Boolean(nearbyNode),
        };
      });
    },
    setInput(next: Partial<InputState>) {
      Object.assign(inputState, next);
    },
    setActiveFrame(frameId: string | null) {
      update((state) => {
        const encounter = syncFieldEncounter(state.encounter, state.run, frameId);
        if (encounter === state.encounter) {
          return state;
        }
        return {
          ...state,
          encounter,
          lastEvent: encounter?.lastSummary ?? encounter?.bark ?? state.lastEvent,
        };
      });
    },
    step(deltaMs: number) {
      update((state) => {
        if (!state.members.length) {
          return state;
        }

        const dt = Math.min(48, Math.max(8, deltaMs)) / 1000;
        const inputX = (inputState.right ? 1 : 0) - (inputState.left ? 1 : 0);
        const inputY = (inputState.down ? 1 : 0) - (inputState.up ? 1 : 0);
        const rawLength = Math.hypot(inputX, inputY);
        const moveScale = rawLength > 0 ? 1 / rawLength : 0;
        const speed = inputState.run ? RUN_SPEED : LEADER_SPEED;
        const vx = inputX * moveScale * speed * dt;
        const vy = inputY * moveScale * speed * dt;
        const leader = state.members[0];
        const leaderPosition = moveWithCollisions(leader, vx, vy);
        const leaderMoving = Math.abs(vx) > 0.5 || Math.abs(vy) > 0.5;
        const nextTick = state.tick + deltaMs;

        const members = state.members.reduce<FieldPartyMemberState[]>((nextMembers, member, index) => {
          if (index === 0) {
            nextMembers.push({
              ...member,
              ...leaderPosition,
              moving: leaderMoving,
              facing: getFacing(vx, vy, member.facing),
              frameIndex: leaderMoving ? animationFrame(nextTick) : 0,
            });
            return nextMembers;
          }

          const previous = nextMembers[index - 1];
          const dx = previous.x - member.x;
          const dy = previous.y - member.y;
          const dist = Math.hypot(dx, dy);
          const desiredDistance = FOLLOW_SPACING + index * 4;
          const canMove = dist > desiredDistance;
          const ratio = canMove && dist > 0 ? Math.min(FOLLOW_SPEED * dt, dist - desiredDistance) / dist : 0;
          const nextX = member.x + dx * ratio;
          const nextY = member.y + dy * ratio;

          nextMembers.push({
            ...member,
            x: nextX,
            y: nextY,
            moving: canMove,
            facing: canMove ? getFacing(dx, dy, member.facing) : member.facing,
            frameIndex: canMove ? animationFrame(nextTick, index * 0.4) : 0,
          });
          return nextMembers;
        }, []);

        const nearbyNode = findNearbyNode(members[0]);
        return {
          ...state,
          members,
          nearbyNodeId: nearbyNode?.id ?? null,
          canInteract: Boolean(nearbyNode),
          tick: nextTick,
        };
      });
    },
    interact(): FieldNode | null {
      const state = get(store);
      const leader = state.members[0];
      if (!leader) {
        return null;
      }
      const node = findNearbyNode(leader);
      if (!node) {
        update((current) => ({
          ...current,
          lastEvent: 'No node is close enough. Move the squad onto a marker first.',
        }));
        return null;
      }

      update((current) => ({
        ...current,
        lastEvent: node.kind === 'CAMP' ? 'The squad settled at camp and steadied itself.' : `Interact with ${node.label}.`,
      }));
      return node;
    },
    setFieldStatus(lastEvent: string, objectiveNodeId?: string) {
      update((state) => ({
        ...state,
        lastEvent,
        objectiveNodeId: objectiveNodeId ?? state.objectiveNodeId,
      }));
    },
    executeCommand(commandId: FieldCommandId) {
      update((state) => {
        if (!state.encounter) {
          return state;
        }

        const result = executeFieldCommand(state.encounter, state.run, commandId);
        return {
          ...state,
          encounter: result.encounter,
          run: result.run,
          lastEvent: result.eventText,
        };
      });
      return get(store).encounter;
    },
    restAtCamp() {
      update((state) => ({
        ...state,
        run: restFieldRun(state.run),
        encounter: state.encounter?.failed ? null : state.encounter,
        lastEvent: 'Camp restored the squad. HP climbed and the next route is safe to read again.',
      }));
    },
  };
}

export const fieldStore = createFieldStore();
