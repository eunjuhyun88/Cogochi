<script lang="ts">
  import { agentFamilyLabels, careStateLabels, growthStageLabels } from '$lib/data/seed';
  import type { OwnedAgent } from '$lib/types';
  import PixelSprite from '$components/shared/PixelSprite.svelte';

  let { agent, href }: { agent: OwnedAgent; href: string } = $props();
</script>

<a class="agent-card panel" href={href}>
  <div class="agent-card__header">
    <div class="agent-card__sprite">
      <PixelSprite {agent} size={78} />
    </div>
    <div>
      <p class="section-kicker">{agent.baseModelLabel}</p>
      <h3>{agent.name}</h3>
      <p>{agent.role}</p>
    </div>
  </div>
  <div class="chip-row">
    <span class="chip">{agentFamilyLabels[agent.family]}</span>
    <span class="chip">Bond {agent.bond}</span>
    <span class="chip">Trust {agent.trustWeight}</span>
    <span class="chip">{growthStageLabels[agent.growthStage]}</span>
    <span class="chip">{careStateLabels[agent.careState]}</span>
    <span class="chip">{agent.status.toLowerCase()}</span>
  </div>
  <p>{agent.recentTrainingFocus}</p>
  <p class="agent-card__meta">Weak link: {agent.weakLink}</p>
  {#if agent.trustedInstincts[0]}
    <p class="agent-card__meta">Trusted instinct: {agent.trustedInstincts[0].label}</p>
  {/if}
  {#if agent.keepsakes[0]}
    <p class="agent-card__meta">Keepsake: {agent.keepsakes[0]}</p>
  {/if}
  <p class="agent-card__meta">Next care: {agent.nextCareAction}</p>
  <p class="agent-card__lesson">{agent.recentLesson}</p>
</a>

<style>
  .agent-card {
    padding: 18px;
    display: grid;
    gap: 14px;
  }

  .agent-card__header {
    display: grid;
    grid-template-columns: 86px 1fr;
    gap: 14px;
    align-items: center;
  }

  .agent-card__sprite {
    width: 78px;
    height: 78px;
    display: grid;
    place-items: center;
    border-radius: 18px;
    background: rgba(238, 243, 216, 0.92);
    padding: 8px;
    border: 1px solid rgba(74, 84, 66, 0.18);
  }

  .agent-card h3,
  .agent-card p {
    margin: 0;
  }

  .agent-card__lesson {
    color: var(--text-soft);
    line-height: 1.5;
  }

  .agent-card__meta {
    margin: 0;
    color: var(--text-soft);
    font-size: 0.92rem;
    line-height: 1.5;
  }
</style>
