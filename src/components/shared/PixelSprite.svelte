<script lang="ts">
  import type { MutationGene, OwnedAgent } from '$lib/types';

  type SpriteOverlayKind = 'antenna' | 'crest' | 'scarf' | 'satchel' | 'shell' | 'halo';
  type SpriteOverlay = {
    id: string;
    kind: SpriteOverlayKind;
    label: string;
  };

  let {
    agent,
    size = 96,
    frameIndex = undefined,
    alt = agent.name,
  }: {
    agent: OwnedAgent;
    size?: number | string;
    frameIndex?: number;
    alt?: string;
  } = $props();

  const spriteSize = $derived(typeof size === 'number' ? `${size}px` : size);
  const activeFrame = $derived(frameIndex ?? agent.spriteFrameIndex);
  const clampedFrame = $derived(Math.max(0, Math.min(activeFrame, agent.spriteFrameCount - 1)));
  const spriteStyle = $derived(
    `--sprite-size:${spriteSize};--frame-count:${agent.spriteFrameCount};--frame-index:${clampedFrame};`,
  );
  const acceptedGenes = $derived(
    Array.from(
      new Set(
        agent.mutations
          .filter((mutation) => mutation.decision === 'ACCEPTED')
          .map((mutation) => mutation.gene),
      ),
    ).slice(0, 2),
  );
  const fallbackGene = $derived(agent.trustedInstincts.find((instinct) => instinct.state === 'TRUSTED')?.gene ?? null);

  function overlayForGene(gene: MutationGene): SpriteOverlay {
    switch (gene) {
      case 'INDICATOR':
        return { id: gene, kind: 'antenna', label: 'Scout lens' };
      case 'DOCTRINE':
        return { id: gene, kind: 'crest', label: 'Doctrine crest' };
      case 'SCRIPT':
        return { id: gene, kind: 'scarf', label: 'Execution scarf' };
      case 'MEMORY':
        return { id: gene, kind: 'satchel', label: 'Archive sigil' };
      case 'RISK':
        return { id: gene, kind: 'shell', label: 'Guard shell' };
      case 'COORDINATION':
        return { id: gene, kind: 'halo', label: 'Captain halo' };
    }
  }

  const overlays = $derived.by(() => {
    const genes = acceptedGenes.length ? acceptedGenes : fallbackGene ? [fallbackGene] : [];
    return genes.map((gene) => overlayForGene(gene));
  });
</script>

<div
  aria-label={alt}
  class:strained={agent.careState !== 'CLEAR'}
  class:signature={agent.growthStage === 'SIGNATURE'}
  class:specialized={agent.growthStage === 'SPECIALIZED'}
  class:tuned={agent.growthStage === 'TUNED'}
  class="pixel-sprite"
  role="img"
  style={spriteStyle}
>
  <img alt="" aria-hidden="true" src={agent.spriteSheet} />
  <div aria-hidden="true" class="pixel-sprite__overlays">
    {#each overlays as overlay (overlay.id)}
      <span class={`pixel-sprite__overlay pixel-sprite__overlay--${overlay.kind}`} title={overlay.label}></span>
    {/each}
    {#if agent.careState !== 'CLEAR'}
      <span class="pixel-sprite__overlay pixel-sprite__overlay--strain"></span>
    {/if}
  </div>
</div>

<style>
  .pixel-sprite {
    width: var(--sprite-size);
    height: var(--sprite-size);
    overflow: hidden;
    position: relative;
    display: inline-block;
    border-radius: 20%;
  }

  .pixel-sprite.tuned {
    filter: drop-shadow(0 0 0.2rem rgba(94, 180, 139, 0.18));
  }

  .pixel-sprite.specialized {
    filter: drop-shadow(0 0 0.28rem rgba(243, 201, 96, 0.22));
  }

  .pixel-sprite.signature {
    filter:
      drop-shadow(0 0 0.35rem rgba(243, 201, 96, 0.28))
      drop-shadow(0 0 0.7rem rgba(110, 214, 173, 0.18));
  }

  .pixel-sprite img {
    display: block;
    height: 100%;
    width: calc(var(--frame-count) * 100%);
    max-width: none;
    image-rendering: pixelated;
    transform: translateX(calc(var(--frame-index) * -100% / var(--frame-count)));
    transform-origin: left top;
  }

  .pixel-sprite__overlays {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .pixel-sprite__overlay {
    position: absolute;
    display: block;
  }

  .pixel-sprite__overlay--antenna {
    left: 50%;
    top: 3%;
    width: 12%;
    height: 24%;
    transform: translateX(-50%);
    background:
      linear-gradient(to bottom, rgba(99, 216, 255, 0.95) 0 26%, transparent 26% 38%, rgba(60, 118, 176, 0.85) 38% 100%);
    border-radius: 999px;
  }

  .pixel-sprite__overlay--crest {
    left: 40%;
    top: 16%;
    width: 22%;
    height: 10%;
    background: rgba(245, 204, 82, 0.95);
    box-shadow:
      0 0 0 1px rgba(145, 88, 36, 0.38),
      0 0 0.12rem rgba(245, 204, 82, 0.25);
  }

  .pixel-sprite__overlay--scarf {
    left: 22%;
    top: 56%;
    width: 56%;
    height: 12%;
    background:
      linear-gradient(90deg, rgba(237, 111, 126, 0.92) 0 68%, rgba(255, 217, 157, 0.88) 68% 100%);
    border-radius: 999px;
  }

  .pixel-sprite__overlay--satchel {
    left: 14%;
    top: 58%;
    width: 18%;
    height: 18%;
    background:
      linear-gradient(180deg, rgba(255, 240, 174, 0.92) 0 28%, rgba(123, 88, 46, 0.92) 28% 100%);
    box-shadow: 0 0 0 1px rgba(94, 67, 31, 0.34);
  }

  .pixel-sprite__overlay--shell {
    left: 32%;
    top: 40%;
    width: 36%;
    height: 22%;
    background:
      linear-gradient(180deg, rgba(102, 186, 131, 0.92) 0 35%, rgba(51, 112, 76, 0.92) 35% 100%);
    border-radius: 45% 45% 35% 35%;
    box-shadow: 0 0 0 1px rgba(40, 74, 53, 0.34);
  }

  .pixel-sprite__overlay--halo {
    left: 22%;
    top: 6%;
    width: 56%;
    height: 18%;
    border: 2px solid rgba(255, 227, 120, 0.88);
    border-radius: 999px;
    box-shadow: 0 0 0.18rem rgba(255, 227, 120, 0.24);
  }

  .pixel-sprite__overlay--strain {
    right: 8%;
    top: 10%;
    width: 14%;
    height: 14%;
    background:
      linear-gradient(135deg, transparent 0 28%, rgba(239, 95, 118, 0.95) 28% 52%, transparent 52% 100%),
      linear-gradient(315deg, transparent 0 36%, rgba(239, 95, 118, 0.95) 36% 56%, transparent 56% 100%);
    opacity: 0.88;
  }

  .pixel-sprite.strained {
    filter: saturate(0.92);
  }
</style>
