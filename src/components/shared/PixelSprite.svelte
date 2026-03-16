<script lang="ts">
  import type { HubStyle, MutationGene, OwnedAgent } from '$lib/types';

  type SpriteOverlayKind = 'antenna' | 'crest' | 'scarf' | 'satchel' | 'shell' | 'halo';
  type SpriteOverlay = {
    id: string;
    kind: SpriteOverlayKind;
    label: string;
  };
  type HomeAdornmentKind =
    | 'field-strap'
    | 'field-pack'
    | 'archive-tab'
    | 'archive-tag'
    | 'proof-sash'
    | 'proof-medal';
  type HomeAdornment = {
    id: string;
    kind: HomeAdornmentKind;
    label: string;
  };

  let {
    agent,
    size = 96,
    frameIndex = undefined,
    alt = agent.name,
    homeStyle = null,
    presentation = 'default',
  }: {
    agent: OwnedAgent;
    size?: number | string;
    frameIndex?: number;
    alt?: string;
    homeStyle?: HubStyle | null;
    presentation?: 'default' | 'hub' | 'detail';
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
  const homeAdornments = $derived.by((): HomeAdornment[] => {
    if (homeStyle === 'field') {
      return [
        { id: 'field-strap', kind: 'field-strap', label: 'Field harness' },
        { id: 'field-pack', kind: 'field-pack', label: 'Travel pack' },
      ];
    }
    if (homeStyle === 'archive') {
      return [
        { id: 'archive-tab', kind: 'archive-tab', label: 'Archive tab' },
        { id: 'archive-tag', kind: 'archive-tag', label: 'Archive tag' },
      ];
    }
    if (homeStyle === 'proof') {
      return [
        { id: 'proof-sash', kind: 'proof-sash', label: 'Proof sash' },
        { id: 'proof-medal', kind: 'proof-medal', label: 'Proof medal' },
      ];
    }
    return [];
  });
</script>

<div
  aria-label={alt}
  class:detail={presentation === 'detail'}
  class:hub={presentation === 'hub'}
  class:strained={agent.careState !== 'CLEAR'}
  class:signature={agent.growthStage === 'SIGNATURE'}
  class:specialized={agent.growthStage === 'SPECIALIZED'}
  class:style-archive={homeStyle === 'archive'}
  class:style-field={homeStyle === 'field'}
  class:style-proof={homeStyle === 'proof'}
  class:tuned={agent.growthStage === 'TUNED'}
  class="pixel-sprite"
  role="img"
  style={spriteStyle}
>
  <img alt="" aria-hidden="true" src={agent.spriteSheet} />
  <div aria-hidden="true" class="pixel-sprite__style-layers">
    {#each homeAdornments as adornment (adornment.id)}
      <span class={`pixel-sprite__style pixel-sprite__style--${adornment.kind}`} title={adornment.label}></span>
    {/each}
  </div>
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

  .pixel-sprite.hub,
  .pixel-sprite.detail {
    background:
      radial-gradient(circle at 50% 24%, rgba(255, 255, 255, 0.24), transparent 54%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.1), transparent 36%);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.34),
      0 0 0 1px rgba(72, 94, 80, 0.12);
  }

  .pixel-sprite.hub.style-field {
    box-shadow:
      inset 0 0 0 1px rgba(210, 232, 199, 0.44),
      0 0 0 1px rgba(87, 129, 102, 0.18);
  }

  .pixel-sprite.hub.style-archive {
    box-shadow:
      inset 0 0 0 1px rgba(244, 231, 192, 0.44),
      0 0 0 1px rgba(132, 111, 71, 0.16);
  }

  .pixel-sprite.hub.style-proof {
    box-shadow:
      inset 0 0 0 1px rgba(252, 233, 156, 0.5),
      0 0 0 1px rgba(181, 144, 58, 0.18);
  }

  .pixel-sprite.detail {
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.28),
      0 0 0 1px rgba(72, 94, 80, 0.08);
  }

  .pixel-sprite.detail.style-field {
    box-shadow:
      inset 0 0 0 1px rgba(214, 230, 202, 0.34),
      0 0 0 1px rgba(87, 129, 102, 0.12);
  }

  .pixel-sprite.detail.style-archive {
    box-shadow:
      inset 0 0 0 1px rgba(242, 232, 202, 0.34),
      0 0 0 1px rgba(132, 111, 71, 0.1);
  }

  .pixel-sprite.detail.style-proof {
    box-shadow:
      inset 0 0 0 1px rgba(247, 232, 177, 0.38),
      0 0 0 1px rgba(181, 144, 58, 0.12);
  }

  .pixel-sprite.detail .pixel-sprite__style-layers {
    opacity: 0.82;
  }

  .pixel-sprite.detail .pixel-sprite__style--field-strap {
    width: 46%;
    height: 7%;
  }

  .pixel-sprite.detail .pixel-sprite__style--field-pack {
    width: 16%;
    height: 20%;
  }

  .pixel-sprite.detail .pixel-sprite__style--archive-tab {
    width: 18%;
    height: 10%;
  }

  .pixel-sprite.detail .pixel-sprite__style--archive-tag {
    width: 13%;
    height: 17%;
  }

  .pixel-sprite.detail .pixel-sprite__style--proof-sash {
    width: 54%;
    height: 9%;
  }

  .pixel-sprite.detail .pixel-sprite__style--proof-medal {
    width: 14%;
    height: 14%;
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

  .pixel-sprite__style-layers {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .pixel-sprite__style {
    position: absolute;
    display: block;
  }

  .pixel-sprite__style--field-strap {
    left: 18%;
    top: 44%;
    width: 52%;
    height: 8%;
    transform: rotate(-30deg);
    background:
      linear-gradient(180deg, rgba(150, 101, 56, 0.92) 0 46%, rgba(84, 58, 34, 0.96) 46% 100%);
    box-shadow: 0 0 0 1px rgba(82, 55, 27, 0.28);
  }

  .pixel-sprite__style--field-pack {
    right: 15%;
    top: 57%;
    width: 18%;
    height: 24%;
    border-radius: 24% 24% 34% 34%;
    background:
      linear-gradient(180deg, rgba(160, 204, 133, 0.96) 0 26%, rgba(77, 119, 67, 0.94) 26% 100%);
    box-shadow: 0 0 0 1px rgba(52, 82, 46, 0.28);
  }

  .pixel-sprite__style--archive-tab {
    right: 10%;
    top: 20%;
    width: 22%;
    height: 11%;
    background:
      linear-gradient(180deg, rgba(255, 243, 194, 0.96) 0 54%, rgba(187, 147, 82, 0.92) 54% 100%);
    box-shadow: 0 0 0 1px rgba(135, 102, 48, 0.24);
  }

  .pixel-sprite__style--archive-tag {
    left: 13%;
    top: 54%;
    width: 16%;
    height: 20%;
    border-radius: 20% 20% 28% 28%;
    background:
      linear-gradient(180deg, rgba(255, 246, 214, 0.95) 0 44%, rgba(214, 176, 108, 0.92) 44% 100%);
    box-shadow: 0 0 0 1px rgba(142, 109, 61, 0.24);
  }

  .pixel-sprite__style--proof-sash {
    left: 18%;
    top: 52%;
    width: 62%;
    height: 11%;
    transform: rotate(-16deg);
    border-radius: 999px;
    background:
      linear-gradient(90deg, rgba(252, 235, 156, 0.98) 0 62%, rgba(220, 109, 110, 0.92) 62% 100%);
    box-shadow: 0 0 0 1px rgba(170, 128, 40, 0.24);
  }

  .pixel-sprite__style--proof-medal {
    left: 57%;
    top: 26%;
    width: 16%;
    height: 16%;
    border-radius: 999px;
    background:
      radial-gradient(circle at 40% 36%, rgba(255, 255, 241, 0.82), transparent 30%),
      linear-gradient(180deg, rgba(255, 236, 169, 0.98) 0 48%, rgba(211, 154, 47, 0.96) 48% 100%);
    box-shadow:
      0 0 0 1px rgba(181, 134, 44, 0.28),
      0 0 0.18rem rgba(255, 229, 132, 0.22);
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
