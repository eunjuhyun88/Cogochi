import { get, writable } from 'svelte/store';
import { advanceBattleState, applyFocusTap, createInitialBattleState } from '../engine/battleEngine';
import { applyBattleRewards, playerStore } from './playerStore';
import type { BattleState } from '../types';

let timer: ReturnType<typeof setInterval> | null = null;

function buildState(): BattleState {
  return createInitialBattleState(get(playerStore));
}

export const battleStore = writable<BattleState>(buildState());

function clearTimer(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

export function startBattle(): void {
  clearTimer();
  battleStore.set(buildState());
  timer = setInterval(() => {
    battleStore.update((state) => {
      const next = advanceBattleState(state, Date.now());
      if (next.result && !next.rewardsApplied) {
        applyBattleRewards(next.result);
        return { ...next, rewardsApplied: true };
      }
      if (!next.running) clearTimer();
      return next;
    });
  }, 1000);
}

export function restartBattle(): void {
  startBattle();
}

export function stopBattle(): void {
  clearTimer();
}

export function focusTap(instanceId: string): void {
  battleStore.update((state) => applyFocusTap(state, instanceId, Date.now()));
}

