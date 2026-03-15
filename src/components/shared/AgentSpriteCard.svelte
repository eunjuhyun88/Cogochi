<script lang="ts">
  import { agentFamilyLabels, careStateLabels, growthStageLabels } from '$lib/data/seed';
  import type { OwnedAgent } from '$lib/types';
  import PixelSprite from '$components/shared/PixelSprite.svelte';

  let { agent, compact = false }: { agent: OwnedAgent; compact?: boolean } = $props();
</script>

<article class:compact class="sprite-card panel">
  <div class="sprite-card__top">
    <div class="sprite-card__display">
      <div class="sprite-card__screen">
        <div class="sprite-card__grid"></div>
        <div class="sprite-card__sprite">
          <PixelSprite {agent} size={96} />
        </div>
      </div>
    </div>
    <div class="stack">
      <div>
        <p class="section-kicker">{agent.baseModelLabel}</p>
        <h3>{agent.name}</h3>
        <p>{agent.role} / bond {agent.bond} / {growthStageLabels[agent.growthStage]}</p>
      </div>
      <div class="chip-row">
        <span class="chip">Lv {agent.level}</span>
        <span class="chip">Trust {agent.trustWeight}</span>
        <span class="chip">{agentFamilyLabels[agent.family]}</span>
        <span class="chip">{careStateLabels[agent.careState]}</span>
        <span class="chip">{agent.recentTrainingFocus}</span>
      </div>
    </div>
  </div>
  <div class="chip-row">
    <span class="chip">Weak link: {agent.weakLink}</span>
    {#if agent.trustedInstincts[0]}
      <span class="chip">Lead instinct: {agent.trustedInstincts[0].label}</span>
    {/if}
  </div>
  {#if agent.keepsakes.length > 0}
    <div class="chip-row">
      {#each agent.keepsakes as keepsake}
        <span class="chip">{keepsake}</span>
      {/each}
    </div>
  {/if}
  <p class="sprite-card__lesson">Next care action: {agent.nextCareAction}</p>
  <p class="sprite-card__lesson">{agent.recentLesson}</p>
</article>

<style>
  .sprite-card {
    padding: 18px;
    display: grid;
    gap: 14px;
  }

  .sprite-card.compact {
    padding: 14px;
  }

  .sprite-card__top {
    display: grid;
    grid-template-columns: 164px 1fr;
    gap: 18px;
    align-items: center;
  }

  .sprite-card__display {
    padding: 12px;
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(237, 243, 222, 0.85), rgba(230, 236, 216, 0.95));
    border: 1px solid rgba(74, 84, 66, 0.16);
  }

  .sprite-card__screen {
    position: relative;
    aspect-ratio: 1;
    border-radius: 18px;
    background: linear-gradient(180deg, #eef3d8, #d9e4ca);
    overflow: hidden;
    display: grid;
    place-items: center;
  }

  .sprite-card__grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(92, 107, 84, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(92, 107, 84, 0.08) 1px, transparent 1px);
    background-size: 18px 18px;
  }

  .sprite-card__sprite {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
  }

  .sprite-card h3,
  .sprite-card p {
    margin: 0;
  }

  .sprite-card__lesson {
    color: var(--text-soft);
    line-height: 1.5;
  }

  @media (max-width: 720px) {
    .sprite-card__top {
      grid-template-columns: 1fr;
    }
  }
</style>
