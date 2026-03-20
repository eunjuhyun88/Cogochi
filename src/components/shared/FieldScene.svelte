<script lang="ts">
  import { browser } from '$app/environment';
  import PixelSprite from '$components/shared/PixelSprite.svelte';
  import {
    chartFieldPadding,
    getChartPriceRange,
    getFieldHistoricalFrames,
    getScenarioFrameTone,
    resolveHistoricalFieldFrameIndex,
  } from '$lib/engine/chart-frame-model';
  import { fieldBarriers, fieldNodes } from '$lib/stores/fieldStore';
  import type { FieldEncounterState, FieldState, OwnedAgent } from '$lib/types';

  let {
    state: fieldState,
    agents,
    encounter = null,
    runtimeCueNodeId = null,
    runtimeCueVerb = null,
  }: {
    state: FieldState;
    agents: OwnedAgent[];
    encounter?: FieldEncounterState | null;
    runtimeCueNodeId?: string | null;
    runtimeCueVerb?: string | null;
  } = $props();
  const chartPadding = {
    top: 72,
    right: chartFieldPadding.right,
    bottom: 108,
    left: chartFieldPadding.left,
  };

  let viewportWidth = $state(0);
  let sceneWidth = $state(0);
  let sceneHeight = $state(0);

  const agentMap = $derived(new Map(agents.map((agent) => [agent.id, agent])));
  const nodeGlyphs = {
    CAMP: 'C',
    LAB: 'L',
    ARCHIVE: 'A',
    JOURNAL: 'J',
    BATTLE_GATE: 'X',
  } as const;
  const leader = $derived(fieldState.members[0] ?? null);
  const runtimeCueNode = $derived(
    runtimeCueNodeId ? fieldNodes.find((node) => node.id === runtimeCueNodeId) ?? null : null,
  );
  const ambientClouds = [
    { id: 'cloud-west', x: 128, y: 126, width: 208, height: 58 },
    { id: 'cloud-mid', x: 1068, y: 168, width: 236, height: 64 },
    { id: 'cloud-east', x: 1988, y: 114, width: 196, height: 56 },
  ];
  const fieldDecorations = [
    { id: 'tuft-1', kind: 'tuft', x: 476, y: 1380, width: 34, height: 20 },
    { id: 'tuft-2', kind: 'tuft', x: 816, y: 1218, width: 38, height: 22 },
    { id: 'tuft-3', kind: 'tuft', x: 1734, y: 1094, width: 34, height: 20 },
    { id: 'tuft-4', kind: 'tuft', x: 2448, y: 954, width: 36, height: 22 },
    { id: 'flower-1', kind: 'flower', x: 612, y: 1218, width: 28, height: 28 },
    { id: 'flower-2', kind: 'flower', x: 1468, y: 658, width: 30, height: 30 },
    { id: 'flower-3', kind: 'flower', x: 2146, y: 912, width: 30, height: 30 },
    { id: 'stone-1', kind: 'stone', x: 1120, y: 1310, width: 44, height: 26 },
    { id: 'stone-2', kind: 'stone', x: 1908, y: 884, width: 52, height: 28 },
    { id: 'stone-3', kind: 'stone', x: 2264, y: 1004, width: 48, height: 26 },
  ];
  const fieldLandmarks = [
    { id: 'camp-house', kind: 'camp-house', x: 388, y: 1060, width: 190, height: 170 },
    { id: 'journal-kiosk', kind: 'journal-kiosk', x: 710, y: 1016, width: 178, height: 150 },
    { id: 'lab-workshop', kind: 'lab-workshop', x: 1120, y: 830, width: 214, height: 186 },
    { id: 'archive-tower', kind: 'archive-tower', x: 1590, y: 474, width: 188, height: 214 },
    { id: 'spar-banner', kind: 'spar-banner', x: 1968, y: 778, width: 180, height: 188 },
    { id: 'battle-fort', kind: 'battle-fort', x: 2246, y: 344, width: 212, height: 232 },
  ];
  const routeNodeIds = ['camp', 'journal-board', 'lab-bench', 'archive-well', 'spar-gate', 'battle-gate'];

  function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  function segmentControlPoint(
    from: { x: number; y: number },
    to: { x: number; y: number },
    segmentIndex: number,
  ) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const offset = segmentIndex % 2 === 0 ? 54 : -54;
    return {
      x: (from.x + to.x) / 2 - (dy / length) * offset,
      y: (from.y + to.y) / 2 + (dx / length) * offset,
    };
  }

  function buildRoutePath(points: Array<{ x: number; y: number }>) {
    if (points.length === 0) {
      return null;
    }

    let path = `M ${points[0].x - 52} ${points[0].y + 42}`;
    for (let index = 1; index < points.length; index += 1) {
      const point = points[index];
      const control = segmentControlPoint(points[index - 1], point, index);
      path += ` Q ${control.x} ${control.y + 42} ${point.x} ${point.y + 42}`;
    }
    return path;
  }

  function frameInnerY(frame: { y: number; height: number }, price: number, min: number, max: number) {
    const span = max - min || 1;
    const innerTop = frame.y + 72;
    const innerBottom = frame.y + frame.height - 64;
    const innerHeight = innerBottom - innerTop;
    return innerTop + ((max - price) / span) * innerHeight;
  }

  function frameCandleX(frame: { x: number; width: number }, candleIndex: number, candleCount: number) {
    const innerLeft = frame.x + 46;
    const innerRight = frame.x + frame.width - 42;
    if (candleCount <= 1) {
      return innerLeft;
    }
    return innerLeft + (candleIndex / (candleCount - 1)) * (innerRight - innerLeft);
  }

  function candleColor(candle: { open: number; close: number }) {
    return candle.close >= candle.open ? 'rgba(76, 236, 161, 0.9)' : 'rgba(246, 101, 120, 0.88)';
  }

  function candleReadState(frameId: string, candleIndex: number) {
    if (!encounter || encounter.frameId !== frameId) {
      return 'revealed';
    }
    if (candleIndex < encounter.visibleCount) {
      return 'revealed';
    }
    if (candleIndex === encounter.visibleCount) {
      return 'incoming';
    }
    return 'hidden';
  }

  const historicalFrames = $derived(getFieldHistoricalFrames());
  const routeWaypoints = $derived(
    routeNodeIds
      .map((nodeId) => fieldNodes.find((node) => node.id === nodeId))
      .filter((node): node is (typeof fieldNodes)[number] => Boolean(node)),
  );
  const routePath = $derived.by(() => buildRoutePath(routeWaypoints));
  const routeStops = $derived(
    routeWaypoints.map((node, index) => ({
      id: node.id,
      x: node.x,
      y: node.y + 42,
      index,
    })),
  );
  const fieldFrames = $derived.by(() => {
    const totalFrames = historicalFrames.length || 1;
    const laneWidth = (fieldState.width - chartPadding.left - chartPadding.right) / totalFrames;
    return historicalFrames.map((frame, index) => {
      const x = chartPadding.left + laneWidth * index - 22;
      const width = laneWidth + 44;
      const y = 36 + (index % 2 === 0 ? 0 : 18);
      const height = fieldState.height - 96 - (index % 2 === 0 ? 0 : 18);
      const range = getChartPriceRange(frame.candles);
      const polylinePoints = frame.candles
        .map(
          (candle, candleIndex) =>
            `${frameCandleX({ x, width }, candleIndex, frame.candles.length)},${frameInnerY({ y, height }, candle.close, range.min, range.max)}`,
        )
        .join(' ');
      const terrainBaseY = y + height - 26;
      return {
        ...frame,
        index,
        x,
        y,
        width,
        height,
        priceRange: range,
        tone: getScenarioFrameTone(frame.candles, 0, frame.candles.length - 1),
        polyline: polylinePoints,
        terrainPoints: `${x + 18},${terrainBaseY} ${polylinePoints} ${x + width - 18},${terrainBaseY}`,
      };
    });
  });
  const encounterFrame = $derived(
    encounter ? fieldFrames.find((frame) => frame.id === encounter.frameId) ?? null : null,
  );
  const leaderFrameIndex = $derived.by(() => {
    if (!leader || fieldFrames.length === 0) {
      return 0;
    }
    return resolveHistoricalFieldFrameIndex(leader.x, fieldState.width);
  });
  const cameraZoom = $derived.by(() => {
    if (!browser) {
      return 1.04;
    }
    if (viewportWidth <= 480) {
      return 1.28;
    }
    if (viewportWidth <= 768) {
      return 1.16;
    }
    if (viewportWidth <= 1100) {
      return 1.04;
    }
    if (viewportWidth <= 1440) {
      return 1.02;
    }
    return 0.98;
  });
  const visibleWorld = $derived.by(() => {
    const zoom = cameraZoom;
    const width = sceneWidth > 0 ? sceneWidth / zoom : fieldState.width / zoom;
    const height = sceneHeight > 0 ? sceneHeight / zoom : fieldState.height / zoom;
    return {
      width,
      height,
    };
  });
  const ambientFocus = $derived.by(() => ({
    x: Math.min(visibleWorld.width * 0.02, 22),
    y: -Math.min(visibleWorld.height * 0.06, 46),
  }));
  const lookAhead = $derived.by(() => {
    if (!leader || !leader.moving) {
      return { x: 0, y: 0 };
    }
    const horizontal = Math.min(visibleWorld.width * 0.1, 88);
    const vertical = Math.min(visibleWorld.height * 0.08, 64);
    if (leader.facing === 'RIGHT') return { x: horizontal, y: 0 };
    if (leader.facing === 'LEFT') return { x: -horizontal, y: 0 };
    if (leader.facing === 'UP') return { x: 0, y: -vertical };
    return { x: 0, y: vertical };
  });
  const camera = $derived.by(() => {
    const zoom = cameraZoom;
    const visibleWidth = visibleWorld.width;
    const visibleHeight = visibleWorld.height;
    const targetX = (leader?.x ?? fieldState.width / 2) + ambientFocus.x + lookAhead.x - visibleWidth / 2;
    const targetY = (leader?.y ?? fieldState.height / 2) + ambientFocus.y + lookAhead.y - visibleHeight / 2;
    const x = clamp(targetX, 0, Math.max(0, fieldState.width - visibleWidth));
    const y = clamp(targetY, 0, Math.max(0, fieldState.height - visibleHeight));
    return {
      x,
      y,
      zoom,
      translateX: -x * zoom,
      translateY: -y * zoom,
    };
  });
  const renderMembers = $derived(
    fieldState.members
      .map((member) => ({ member, agent: agentMap.get(member.agentId) ?? null }))
      .filter((entry): entry is { member: FieldState['members'][number]; agent: OwnedAgent } => entry.agent !== null),
  );
  const cueGuidePath = $derived.by(() => {
    if (!leader || !runtimeCueNode) {
      return null;
    }
    const midX = (leader.x + runtimeCueNode.x) / 2;
    const controlY = Math.min(leader.y, runtimeCueNode.y) - 140;
    return `M ${leader.x} ${leader.y - 34} Q ${midX} ${controlY} ${runtimeCueNode.x} ${runtimeCueNode.y - 18}`;
  });
</script>

<svelte:window bind:innerWidth={viewportWidth} />

<div
  bind:clientHeight={sceneHeight}
  bind:clientWidth={sceneWidth}
  class="field-scene"
  style={`--field-width:${fieldState.width}px;--field-height:${fieldState.height}px;`}
>
  <div class="field-scene__sun" aria-hidden="true"></div>
  <div
    class="field-world"
    style={`transform: translate3d(${camera.translateX}px, ${camera.translateY}px, 0) scale(${camera.zoom});`}
  >
    <div class="field-world__base" aria-hidden="true"></div>
    <div class="field-world__grid" aria-hidden="true"></div>
    <div class="field-scene__skyline" aria-hidden="true"></div>
    {#each ambientClouds as cloud}
      <div
        aria-hidden="true"
        class="field-cloud"
        style={`left:${cloud.x}px;top:${cloud.y}px;width:${cloud.width}px;height:${cloud.height}px;`}
      ></div>
    {/each}
    <svg
      aria-hidden="true"
      class="field-scene__chart"
      preserveAspectRatio="none"
      viewBox={`0 0 ${fieldState.width} ${fieldState.height}`}
    >
      {#each fieldFrames as frame}
        <rect
          class:active={leaderFrameIndex === frame.index}
          class:encounter={encounterFrame?.id === frame.id}
          class={`field-scene__frame field-scene__frame--${frame.tone}`}
          height={frame.height}
          rx="38"
          width={frame.width}
          x={frame.x}
          y={frame.y}
        ></rect>
        <polyline class={`field-scene__terrain field-scene__terrain--${frame.tone}`} points={frame.terrainPoints}></polyline>

        <text class="field-scene__frame-date" x={frame.x + 28} y={frame.y + 34}>{frame.shortLabel}</text>
        <text class="field-scene__frame-title" x={frame.x + 28} y={frame.y + 62}>{frame.title}</text>

        <polyline class="field-scene__chart-line" fill="none" points={frame.polyline}></polyline>

        {#each frame.candles as candle, candleIndex}
          {@const readState = candleReadState(frame.id, candleIndex)}
          <line
            class:hidden={readState === 'hidden'}
            class:incoming={readState === 'incoming'}
            class="field-scene__wick"
            stroke={candleColor(candle)}
            x1={frameCandleX(frame, candleIndex, frame.candles.length)}
            x2={frameCandleX(frame, candleIndex, frame.candles.length)}
            y1={frameInnerY(frame, candle.high, frame.priceRange.min, frame.priceRange.max)}
            y2={frameInnerY(frame, candle.low, frame.priceRange.min, frame.priceRange.max)}
          ></line>
          <rect
            class:hidden={readState === 'hidden'}
            class:incoming={readState === 'incoming'}
            class="field-scene__candle-body"
            fill={candleColor(candle)}
            height={Math.max(
              22,
              Math.abs(
                frameInnerY(frame, candle.open, frame.priceRange.min, frame.priceRange.max) -
                  frameInnerY(frame, candle.close, frame.priceRange.min, frame.priceRange.max),
              ),
            )}
            rx="8"
            width="24"
            x={frameCandleX(frame, candleIndex, frame.candles.length) - 12}
            y={Math.min(
              frameInnerY(frame, candle.open, frame.priceRange.min, frame.priceRange.max),
              frameInnerY(frame, candle.close, frame.priceRange.min, frame.priceRange.max),
            )}
          ></rect>
        {/each}

        {#if encounter && encounter.frameId === frame.id}
          <line
            class="field-scene__read-line field-scene__read-line--support"
            x1={frame.x + 20}
            x2={frame.x + frame.width - 20}
            y1={frameInnerY(frame, encounter.supportPrice, frame.priceRange.min, frame.priceRange.max)}
            y2={frameInnerY(frame, encounter.supportPrice, frame.priceRange.min, frame.priceRange.max)}
          ></line>
          <line
            class="field-scene__read-line field-scene__read-line--resistance"
            x1={frame.x + 20}
            x2={frame.x + frame.width - 20}
            y1={frameInnerY(frame, encounter.resistancePrice, frame.priceRange.min, frame.priceRange.max)}
            y2={frameInnerY(frame, encounter.resistancePrice, frame.priceRange.min, frame.priceRange.max)}
          ></line>
          {#if encounter.hazardPrice !== null}
            <line
              class="field-scene__read-line field-scene__read-line--hazard"
              x1={frame.x + 20}
              x2={frame.x + frame.width - 20}
              y1={frameInnerY(frame, encounter.hazardPrice, frame.priceRange.min, frame.priceRange.max)}
              y2={frameInnerY(frame, encounter.hazardPrice, frame.priceRange.min, frame.priceRange.max)}
            ></line>
          {/if}
          <text class="field-scene__encounter-call" x={frame.x + frame.width - 26} y={frame.y + 34}>
            {encounter.recommendedCommandId}
          </text>
        {/if}
      {/each}

      {#if routePath}
        <path class="field-scene__route-shadow" d={routePath}></path>
        <path class="field-scene__route-bed" d={routePath}></path>
        <path class="field-scene__route-center" d={routePath}></path>
      {/if}

      {#each routeStops as stop}
        <circle
          class:objective={fieldState.objectiveNodeId === stop.id}
          class:runtimeCue={runtimeCueNodeId === stop.id}
          class="field-scene__route-stop"
          cx={stop.x}
          cy={stop.y}
          r="11"
        ></circle>
      {/each}

      {#if cueGuidePath}
        <path class="field-scene__cue-guide" d={cueGuidePath}></path>
      {/if}
    </svg>

    {#each fieldDecorations as prop}
      <div
        aria-hidden="true"
        class={`field-prop field-prop--${prop.kind}`}
        style={`left:${prop.x}px;top:${prop.y}px;width:${prop.width}px;height:${prop.height}px;`}
      ></div>
    {/each}

    {#each fieldLandmarks as landmark}
      <div
        aria-hidden="true"
        class={`field-landmark field-landmark--${landmark.kind}`}
        style={`left:${landmark.x}px;top:${landmark.y}px;width:${landmark.width}px;height:${landmark.height}px;`}
      ></div>
    {/each}

    {#each fieldBarriers as barrier}
      <div
        aria-hidden="true"
        class={`field-barrier field-barrier--${barrier.kind}`}
        style={`left:${barrier.x}px;top:${barrier.y}px;width:${barrier.width}px;height:${barrier.height}px;`}
      ></div>
    {/each}

    {#each fieldNodes as node}
      <div
        class:active={fieldState.nearbyNodeId === node.id}
        class:objective={fieldState.objectiveNodeId === node.id}
        class:runtimeCue={runtimeCueNodeId === node.id}
        class={`field-node field-node--${node.kind.toLowerCase()}`}
        style={`left:${node.x}px;top:${node.y}px;`}
        title={node.label}
      >
        <div class="field-node__pad"></div>
        {#if runtimeCueNodeId === node.id}
          <div class="field-node__beam"></div>
        {/if}
        <div class="field-node__stem"></div>
        <div class="field-node__pulse"></div>
        <div class="field-node__core">
          <span>{nodeGlyphs[node.kind]}</span>
        </div>
        {#if runtimeCueNodeId === node.id || fieldState.objectiveNodeId === node.id || fieldState.nearbyNodeId === node.id}
          <div class="field-node__label">{node.label}</div>
        {/if}
        {#if runtimeCueNodeId === node.id && runtimeCueVerb}
          <div class="field-node__tag">{runtimeCueVerb}</div>
        {/if}
      </div>
    {/each}

    {#each renderMembers as entry (entry.member.agentId)}
      {@const member = entry.member}
      {@const agent = entry.agent}
      <div
        class:leader={member.isLeader}
        class="field-member"
        style={`left:${member.x}px;top:${member.y}px;`}
      >
        <img alt="" aria-hidden="true" class="field-member__shadow" src="/assets/dino/shadow.png" />
        <div class={`field-member__body field-member__body--${member.facing.toLowerCase()}`}>
          <PixelSprite agent={agent} frameIndex={member.frameIndex} size={84} alt={agent.name} />
        </div>
        {#if member.isLeader}
          <div class="field-member__leader-mark" aria-hidden="true"></div>
        {/if}
      </div>
    {/each}
  </div>

</div>

<style>
  .field-scene {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    border: 1px solid rgba(246, 208, 141, 0.3);
    background:
      radial-gradient(circle at top left, rgba(255, 247, 214, 0.58), transparent 20%),
      radial-gradient(circle at 88% 10%, rgba(144, 240, 255, 0.28), transparent 24%),
      linear-gradient(180deg, rgba(131, 228, 247, 0.98) 0%, rgba(150, 230, 238, 0.98) 24%, rgba(247, 214, 154, 0.97) 24.1%, rgba(238, 189, 110, 0.98) 62%, rgba(216, 150, 79, 0.98) 100%);
    box-shadow:
      inset 0 0 0 1px rgba(255, 250, 238, 0.16),
      inset 0 18px 34px rgba(255, 255, 255, 0.08),
      0 28px 70px rgba(11, 19, 24, 0.26);
  }

  .field-scene::before,
  .field-scene::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .field-scene::before {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.16), transparent 18%),
      radial-gradient(circle at 50% 100%, rgba(151, 95, 36, 0.14), transparent 44%);
    opacity: 0.9;
  }

  .field-scene::after {
    z-index: 3;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 18%, transparent 82%, rgba(41, 28, 13, 0.08)),
      radial-gradient(circle at center, transparent 58%, rgba(39, 27, 12, 0.18) 100%);
  }

  .field-scene__sun {
    position: absolute;
    top: 26px;
    right: 64px;
    width: 144px;
    height: 144px;
    border-radius: 999px;
    background:
      radial-gradient(circle, rgba(255, 252, 225, 0.96) 0 20%, rgba(255, 218, 123, 0.52) 21% 54%, rgba(255, 223, 145, 0) 55% 100%);
    opacity: 0.94;
    pointer-events: none;
    filter: blur(0.5px) drop-shadow(0 0 28px rgba(255, 214, 124, 0.24));
  }

  .field-world {
    position: absolute;
    inset: 0;
    width: var(--field-width);
    height: var(--field-height);
    transform-origin: top left;
    will-change: transform;
    transition: transform 96ms linear;
  }

  .field-world__base {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 14% 66%, rgba(110, 220, 248, 0.88) 0 12%, transparent 13%),
      radial-gradient(circle at 78% 16%, rgba(255, 245, 204, 0.32), transparent 18%),
      linear-gradient(180deg, rgba(140, 229, 248, 0.98) 0%, rgba(153, 228, 235, 0.98) 24%, rgba(251, 214, 148, 0.96) 24.1%, rgba(233, 185, 103, 0.98) 68%, rgba(210, 147, 73, 0.98) 100%);
  }

  .field-world__grid {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0)),
      repeating-linear-gradient(
        to right,
        rgba(255, 255, 255, 0.015) 0,
        rgba(255, 255, 255, 0.015) 59px,
        rgba(201, 162, 95, 0.06) 59px,
        rgba(201, 162, 95, 0.06) 60px
      ),
      repeating-linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.012) 0,
        rgba(255, 255, 255, 0.012) 59px,
        rgba(201, 162, 95, 0.04) 59px,
        rgba(201, 162, 95, 0.04) 60px
      );
    opacity: 0.18;
  }

  .field-scene__skyline {
    position: absolute;
    inset: auto 0 0;
    height: 44%;
    background:
      radial-gradient(circle at 14% 18%, rgba(255, 248, 224, 0.24), transparent 18%),
      linear-gradient(180deg, rgba(255, 231, 180, 0), rgba(239, 189, 110, 0.14) 20%, rgba(168, 104, 45, 0.28) 100%);
  }

  .field-cloud {
    position: absolute;
    border-radius: 999px;
    background:
      radial-gradient(circle at 28% 48%, rgba(255, 255, 255, 0.92) 0 24%, transparent 25%),
      radial-gradient(circle at 48% 42%, rgba(255, 255, 255, 0.94) 0 30%, transparent 31%),
      radial-gradient(circle at 68% 50%, rgba(255, 255, 255, 0.9) 0 24%, transparent 25%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(230, 240, 244, 0.68));
    opacity: 0.62;
    filter: drop-shadow(0 10px 12px rgba(85, 128, 143, 0.16));
    animation: field-cloud-drift 26s linear infinite;
  }

  .field-scene__chart {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.88;
  }

  .field-scene__frame {
    stroke: rgba(170, 124, 67, 0.2);
    stroke-width: 2;
    filter: drop-shadow(0 12px 18px rgba(120, 84, 42, 0.14));
  }

  .field-scene__frame--bull {
    fill: rgba(88, 193, 166, 0.18);
  }

  .field-scene__frame--bear {
    fill: rgba(243, 163, 118, 0.2);
  }

  .field-scene__frame--flat {
    fill: rgba(244, 216, 160, 0.16);
  }

  .field-scene__frame.active {
    stroke: rgba(195, 120, 58, 0.48);
    fill: rgba(255, 244, 208, 0.24);
  }

  .field-scene__frame.encounter {
    stroke: rgba(94, 198, 165, 0.56);
    fill: rgba(229, 252, 243, 0.18);
  }

  .field-scene__terrain {
    fill: none;
    stroke-width: 86;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.98;
    filter: drop-shadow(0 18px 18px rgba(117, 82, 40, 0.12));
  }

  .field-scene__terrain--bull {
    stroke: rgba(232, 189, 98, 0.78);
  }

  .field-scene__terrain--bear {
    stroke: rgba(219, 155, 91, 0.74);
  }

  .field-scene__terrain--flat {
    stroke: rgba(227, 188, 118, 0.68);
  }

  .field-scene__frame-date {
    fill: rgba(121, 96, 60, 0.62);
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .field-scene__frame-title {
    fill: rgba(111, 73, 34, 0.88);
    font-size: 16px;
    font-weight: 600;
  }

  .field-scene__chart-line {
    stroke: rgba(129, 91, 45, 0.42);
    stroke-width: 7;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: drop-shadow(0 4px 10px rgba(131, 93, 48, 0.18));
  }

  .field-scene__route-shadow,
  .field-scene__route-bed,
  .field-scene__route-center {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .field-scene__route-shadow {
    stroke: rgba(118, 85, 43, 0.2);
    stroke-width: 78;
  }

  .field-scene__route-bed {
    stroke: rgba(169, 120, 58, 0.84);
    stroke-width: 58;
    filter: drop-shadow(0 12px 14px rgba(127, 89, 42, 0.2));
  }

  .field-scene__route-center {
    stroke: rgba(255, 242, 202, 0.92);
    stroke-width: 8;
    stroke-dasharray: 16 18;
    filter: drop-shadow(0 0 10px rgba(255, 246, 220, 0.18));
    animation: route-center-flow 4s linear infinite;
  }

  .field-scene__route-stop {
    fill: rgba(97, 186, 205, 0.96);
    stroke: rgba(255, 241, 210, 0.88);
    stroke-width: 4;
    filter: drop-shadow(0 4px 12px rgba(53, 100, 117, 0.18));
  }

  .field-scene__route-stop.objective {
    fill: rgba(255, 198, 109, 0.96);
  }

  .field-scene__route-stop.runtimeCue {
    fill: rgba(86, 227, 216, 0.94);
    filter: drop-shadow(0 0 12px rgba(86, 227, 216, 0.2));
  }

  .field-scene__cue-guide {
    fill: none;
    stroke: rgba(255, 245, 212, 0.88);
    stroke-width: 8;
    stroke-linecap: round;
    stroke-dasharray: 18 14;
    filter: drop-shadow(0 0 16px rgba(244, 223, 150, 0.24));
    animation: cue-guide-flow 2.4s linear infinite;
  }

  .field-scene__wick {
    stroke-width: 5;
    stroke-linecap: round;
    opacity: 0.9;
  }

  .field-scene__wick.incoming,
  .field-scene__candle-body.incoming {
    opacity: 0.36;
  }

  .field-scene__wick.hidden,
  .field-scene__candle-body.hidden {
    opacity: 0.12;
  }

  .field-scene__candle-body {
    transition: opacity 140ms ease;
  }

  .field-scene__read-line {
    stroke-width: 5;
    stroke-linecap: round;
    stroke-dasharray: 18 14;
    filter: drop-shadow(0 0 12px rgba(0, 0, 0, 0.12));
  }

  .field-scene__read-line--support {
    stroke: rgba(65, 183, 136, 0.88);
  }

  .field-scene__read-line--resistance {
    stroke: rgba(205, 116, 88, 0.9);
  }

  .field-scene__read-line--hazard {
    stroke: rgba(242, 205, 119, 0.92);
  }

  .field-scene__encounter-call {
    fill: rgba(255, 248, 226, 0.96);
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-anchor: end;
    text-transform: uppercase;
    filter: drop-shadow(0 2px 6px rgba(122, 84, 38, 0.16));
  }

  .field-prop {
    position: absolute;
    z-index: 1;
    pointer-events: none;
  }

  .field-landmark {
    position: absolute;
    z-index: 1;
    pointer-events: none;
    border-radius: 18px;
    filter: drop-shadow(0 18px 18px rgba(128, 84, 32, 0.18));
  }

  .field-landmark::before,
  .field-landmark::after {
    content: '';
    position: absolute;
  }

  .field-landmark--camp-house {
    background:
      linear-gradient(180deg, rgba(242, 206, 142, 0.98), rgba(220, 168, 92, 0.98));
    border: 8px solid rgba(144, 98, 48, 0.64);
    border-bottom-width: 14px;
  }

  .field-landmark--camp-house::before {
    inset: -36px 12px auto;
    height: 54px;
    border-radius: 18px 18px 8px 8px;
    background: linear-gradient(180deg, rgba(132, 83, 44, 0.98), rgba(111, 69, 34, 0.98));
    clip-path: polygon(10% 100%, 50% 0, 90% 100%);
  }

  .field-landmark--camp-house::after {
    inset: auto 28px 14px;
    height: 52px;
    border-radius: 12px;
    background:
      linear-gradient(90deg, transparent 0 38%, rgba(112, 73, 31, 0.96) 38% 62%, transparent 62% 100%),
      linear-gradient(180deg, rgba(77, 164, 214, 0.9), rgba(36, 104, 149, 0.92));
  }

  .field-landmark--journal-kiosk {
    background:
      linear-gradient(180deg, rgba(233, 215, 178, 0.98), rgba(206, 173, 112, 0.98));
    border: 6px solid rgba(136, 94, 44, 0.58);
  }

  .field-landmark--journal-kiosk::before {
    inset: 16px 14px auto;
    height: 64px;
    border-radius: 10px;
    background:
      linear-gradient(90deg, rgba(193, 150, 83, 0.96) 0 12%, transparent 12% 88%, rgba(193, 150, 83, 0.96) 88% 100%),
      linear-gradient(180deg, rgba(98, 58, 26, 0.96), rgba(74, 44, 20, 0.96));
  }

  .field-landmark--journal-kiosk::after {
    inset: auto 34px 14px;
    height: 58px;
    border-radius: 8px;
    background:
      linear-gradient(90deg, rgba(137, 91, 40, 0.96) 0 10%, transparent 10% 90%, rgba(137, 91, 40, 0.96) 90% 100%),
      linear-gradient(180deg, rgba(255, 245, 220, 0.98), rgba(248, 228, 173, 0.98));
  }

  .field-landmark--lab-workshop {
    background:
      linear-gradient(180deg, rgba(240, 218, 176, 0.98), rgba(223, 170, 102, 0.98));
    border: 8px solid rgba(128, 79, 38, 0.62);
    border-bottom-width: 16px;
  }

  .field-landmark--lab-workshop::before {
    inset: -42px 12px auto;
    height: 64px;
    border-radius: 24px 24px 10px 10px;
    background: linear-gradient(180deg, rgba(96, 74, 146, 0.98), rgba(77, 51, 123, 0.98));
    clip-path: polygon(4% 100%, 18% 34%, 40% 14%, 58% 20%, 80% 8%, 96% 100%);
  }

  .field-landmark--lab-workshop::after {
    inset: auto 22px 16px;
    height: 54px;
    border-radius: 12px;
    background:
      linear-gradient(90deg, rgba(103, 64, 35, 0.96) 0 16%, transparent 16% 84%, rgba(103, 64, 35, 0.96) 84% 100%),
      linear-gradient(180deg, rgba(85, 191, 214, 0.92), rgba(53, 112, 162, 0.96));
  }

  .field-landmark--archive-tower {
    border-radius: 20px 20px 28px 28px;
    background:
      linear-gradient(180deg, rgba(245, 222, 176, 0.98), rgba(222, 169, 96, 0.98));
    border: 8px solid rgba(137, 88, 38, 0.6);
  }

  .field-landmark--archive-tower::before {
    inset: -56px 28px auto;
    height: 92px;
    border-radius: 28px 28px 18px 18px;
    background: linear-gradient(180deg, rgba(167, 112, 52, 0.98), rgba(128, 82, 34, 0.98));
    clip-path: polygon(50% 0, 88% 18%, 100% 72%, 88% 100%, 12% 100%, 0 72%, 12% 18%);
  }

  .field-landmark--archive-tower::after {
    inset: 22px 36px auto;
    height: 92px;
    border-radius: 12px;
    background:
      linear-gradient(90deg, rgba(120, 81, 43, 0.96) 0 20%, transparent 20% 80%, rgba(120, 81, 43, 0.96) 80% 100%),
      linear-gradient(180deg, rgba(93, 196, 202, 0.88), rgba(52, 126, 166, 0.92));
  }

  .field-landmark--spar-banner {
    background:
      linear-gradient(180deg, rgba(127, 191, 190, 0.28), rgba(127, 191, 190, 0.02));
  }

  .field-landmark--spar-banner::before {
    inset: 8px auto 8px 18px;
    width: 16px;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(145, 96, 42, 0.98), rgba(102, 62, 26, 0.98));
    box-shadow:
      98px 0 0 rgba(145, 96, 42, 0.98),
      50px 18px 0 0 rgba(145, 96, 42, 0.98);
  }

  .field-landmark--spar-banner::after {
    inset: 22px 24px auto;
    height: 82px;
    border-radius: 16px;
    background:
      linear-gradient(90deg, rgba(255, 238, 210, 0.18), transparent 55%),
      linear-gradient(180deg, rgba(90, 233, 216, 0.98), rgba(52, 176, 177, 0.98));
    clip-path: polygon(0 0, 100% 0, 100% 76%, 62% 100%, 0 80%);
  }

  .field-landmark--battle-fort {
    background:
      linear-gradient(180deg, rgba(247, 212, 148, 0.98), rgba(220, 156, 82, 0.98));
    border: 9px solid rgba(143, 89, 40, 0.64);
    border-bottom-width: 16px;
  }

  .field-landmark--battle-fort::before {
    inset: -34px 14px auto;
    height: 52px;
    border-radius: 20px 20px 8px 8px;
    background:
      linear-gradient(
        90deg,
        rgba(153, 94, 42, 0.98) 0 12%,
        rgba(204, 140, 70, 0.98) 12% 24%,
        rgba(153, 94, 42, 0.98) 24% 36%,
        rgba(204, 140, 70, 0.98) 36% 48%,
        rgba(153, 94, 42, 0.98) 48% 60%,
        rgba(204, 140, 70, 0.98) 60% 72%,
        rgba(153, 94, 42, 0.98) 72% 84%,
        rgba(204, 140, 70, 0.98) 84% 100%
      );
  }

  .field-landmark--battle-fort::after {
    inset: auto 30px 18px;
    height: 84px;
    border-radius: 18px;
    background:
      radial-gradient(circle at 50% 74%, rgba(255, 143, 68, 0.86) 0 18%, transparent 19%),
      linear-gradient(180deg, rgba(110, 69, 32, 0.98), rgba(84, 45, 19, 0.98));
  }

  .field-prop--tuft {
    border-radius: 999px 999px 12px 12px;
    background:
      radial-gradient(circle at 28% 88%, rgba(72, 134, 84, 0.84) 0 18%, transparent 19%),
      radial-gradient(circle at 50% 26%, rgba(155, 214, 103, 0.96) 0 28%, transparent 29%),
      radial-gradient(circle at 74% 88%, rgba(72, 134, 84, 0.84) 0 18%, transparent 19%);
  }

  .field-prop--flower {
    border-radius: 999px;
    background:
      radial-gradient(circle, rgba(255, 245, 222, 0.98) 0 22%, transparent 23%),
      radial-gradient(circle at 24% 32%, rgba(250, 170, 170, 0.92) 0 18%, transparent 19%),
      radial-gradient(circle at 72% 32%, rgba(255, 205, 132, 0.92) 0 18%, transparent 19%),
      radial-gradient(circle at 32% 72%, rgba(255, 220, 146, 0.92) 0 18%, transparent 19%),
      radial-gradient(circle at 68% 72%, rgba(247, 188, 225, 0.92) 0 18%, transparent 19%);
  }

  .field-prop--stone {
    border-radius: 18px;
    background:
      linear-gradient(180deg, rgba(154, 149, 127, 0.94), rgba(112, 105, 88, 0.94));
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.26),
      0 6px 12px rgba(82, 80, 60, 0.16);
  }

  .field-barrier {
    position: absolute;
    border-radius: 24px;
    border: 1px solid rgba(142, 115, 72, 0.18);
    box-sizing: border-box;
    overflow: hidden;
    opacity: 0.64;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.22),
      0 14px 24px rgba(136, 104, 54, 0.14);
  }

  .field-barrier--support {
    background:
      linear-gradient(
        180deg,
        rgba(236, 240, 176, 0.98) 0 12%,
        rgba(149, 189, 100, 0.72) 12% 20%,
        rgba(110, 90, 58, 0.24) 20% 34%,
        rgba(110, 90, 58, 0.04) 34% 48%,
        rgba(110, 90, 58, 0) 48% 100%
      );
    clip-path: polygon(0 34%, 10% 24%, 22% 18%, 35% 22%, 49% 16%, 64% 20%, 79% 18%, 92% 24%, 100% 32%, 100% 100%, 0 100%);
  }

  .field-barrier--pit {
    background:
      radial-gradient(circle at top, rgba(248, 186, 91, 0.62), transparent 28%),
      linear-gradient(180deg, rgba(124, 83, 38, 0.84), rgba(63, 37, 17, 0.98));
    border-color: rgba(139, 97, 55, 0.32);
  }

  .field-barrier--resistance {
    background:
      repeating-linear-gradient(
        180deg,
        rgba(227, 178, 108, 0.94) 0,
        rgba(227, 178, 108, 0.94) 18px,
        rgba(183, 120, 55, 0.98) 18px,
        rgba(183, 120, 55, 0.98) 36px
      );
    border-color: rgba(158, 111, 61, 0.32);
  }

  .field-barrier--wall {
    background:
      linear-gradient(180deg, rgba(154, 170, 163, 0.05), rgba(108, 118, 112, 0.08)),
      repeating-linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.015) 0,
        rgba(255, 255, 255, 0.015) 24px,
        rgba(79, 89, 83, 0.02) 24px,
        rgba(79, 89, 83, 0.02) 48px
      );
    border-color: rgba(102, 108, 98, 0.08);
    opacity: 0.42;
    clip-path: polygon(4% 16%, 96% 16%, 100% 100%, 0 100%);
  }

  .field-node {
    position: absolute;
    transform: translate(-50%, -50%);
    width: 52px;
    height: 92px;
    z-index: 2;
  }

  .field-node__pad {
    position: absolute;
    inset: auto auto -8px 50%;
    width: 92px;
    height: 28px;
    margin-left: -46px;
    border-radius: 999px;
    background:
      radial-gradient(circle, rgba(0, 0, 0, 0.2) 0 36%, rgba(0, 0, 0, 0.04) 37% 72%, transparent 73% 100%),
      rgba(83, 119, 106, 0.08);
    filter: blur(0.4px);
  }

  .field-node__stem {
    position: absolute;
    inset: 34px auto auto 50%;
    width: 6px;
    height: 50px;
    margin-left: -3px;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(136, 101, 52, 0.8), rgba(150, 122, 64, 0.04));
    opacity: 0.84;
  }

  .field-node__pulse {
    position: absolute;
    inset: 0 auto auto 50%;
    width: 32px;
    height: 32px;
    margin-left: -16px;
    border-radius: 999px;
    background: rgba(230, 215, 154, 0.12);
    box-shadow: 0 0 0 12px rgba(230, 215, 154, 0.03);
  }

  .field-node__core {
    position: absolute;
    inset: 0 auto auto 50%;
    width: 52px;
    height: 40px;
    margin-left: -26px;
    border-radius: 16px;
    background:
      linear-gradient(180deg, rgba(132, 88, 44, 0.94), rgba(171, 117, 58, 0.92));
    border: 1px solid rgba(255, 232, 185, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.24),
      inset 0 1px 0 rgba(255, 245, 220, 0.12);
  }

  .field-node__beam {
    position: absolute;
    inset: -110px auto auto 50%;
    width: 12px;
    height: 124px;
    margin-left: -6px;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(246, 232, 168, 0), rgba(246, 232, 168, 0.64) 52%, rgba(246, 232, 168, 0));
    filter: blur(1px);
    opacity: 0.84;
  }

  .field-node__tag {
    position: absolute;
    inset: -18px auto auto 50%;
    transform: translateX(-50%);
    min-width: 74px;
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid rgba(177, 133, 63, 0.24);
    background: rgba(84, 50, 21, 0.88);
    color: rgba(255, 245, 220, 0.94);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-align: center;
    text-transform: uppercase;
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
  }

  .field-node__label {
    position: absolute;
    inset: 100% auto auto 50%;
    transform: translate(-50%, 6px);
    min-width: max-content;
    max-width: 120px;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(255, 250, 239, 0.94);
    border: 1px solid rgba(175, 143, 80, 0.24);
    color: rgba(86, 57, 24, 0.9);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-align: center;
    white-space: nowrap;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
  }

  .field-node__core span {
    color: rgba(255, 246, 224, 0.98);
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.06em;
  }

  .field-node.active {
    filter: drop-shadow(0 0 12px rgba(164, 198, 100, 0.22));
  }

  .field-node.active .field-node__core {
    border-color: rgba(110, 165, 84, 0.32);
    background: linear-gradient(180deg, rgba(114, 147, 68, 0.96), rgba(89, 128, 59, 0.94));
  }

  .field-node.objective .field-node__core {
    border-color: rgba(198, 153, 68, 0.34);
    background: linear-gradient(180deg, rgba(183, 117, 53, 0.98), rgba(136, 86, 35, 0.94));
  }

  .field-node.objective .field-node__pulse {
    background: rgba(245, 223, 153, 0.24);
    box-shadow: 0 0 0 10px rgba(245, 223, 153, 0.08);
  }

  .field-node.runtimeCue {
    filter: drop-shadow(0 0 18px rgba(245, 223, 153, 0.22));
  }

  .field-node.runtimeCue .field-node__core {
    border-color: rgba(214, 170, 78, 0.42);
    background: linear-gradient(180deg, rgba(61, 151, 142, 0.98), rgba(48, 122, 119, 0.95));
    box-shadow:
      0 12px 26px rgba(0, 0, 0, 0.24),
      inset 0 0 0 1px rgba(245, 223, 153, 0.1);
  }

  .field-node.runtimeCue .field-node__pulse {
    background: rgba(245, 223, 153, 0.3);
    box-shadow:
      0 0 0 12px rgba(245, 223, 153, 0.09),
      0 0 32px rgba(245, 223, 153, 0.16);
  }

  .field-member {
    position: absolute;
    transform: translate(-50%, -72%);
    display: grid;
    justify-items: center;
    gap: 2px;
    z-index: 4;
  }

  .field-member.leader {
    z-index: 5;
  }

  .field-member__shadow {
    width: 68px;
    height: 68px;
    image-rendering: pixelated;
    opacity: 0.42;
    transform: translateY(48px);
  }

  .field-member__body {
    position: absolute;
    inset: auto auto 24px;
    transition: transform 120ms ease-out;
  }

  .field-member__body--left {
    transform: translateY(0) scaleX(-1);
  }

  .field-member__body--up {
    transform: translateY(-3px);
  }

  .field-member__body--down {
    transform: translateY(1px);
  }

  .field-member__leader-mark {
    width: 18px;
    height: 12px;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(248, 231, 177, 0.9), rgba(227, 183, 85, 0.86));
    box-shadow: 0 0 0 8px rgba(248, 231, 177, 0.04);
    transform: translateY(76px);
  }

  @keyframes cue-guide-flow {
    0% {
      stroke-dashoffset: 0;
    }

    100% {
      stroke-dashoffset: -64;
    }
  }

  @keyframes field-cloud-drift {
    0% {
      transform: translateX(0);
    }

    50% {
      transform: translateX(10px);
    }

    100% {
      transform: translateX(0);
    }
  }

  @keyframes route-center-flow {
    0% {
      stroke-dashoffset: 0;
    }

    100% {
      stroke-dashoffset: -68;
    }
  }

  @media (max-width: 900px) {
    .field-node {
      transform: translate(-50%, -50%) scale(0.84);
    }

    .field-scene__history-card {
      width: min(300px, calc(100% - 32px));
      left: 16px;
      top: 64px;
      padding: 14px 16px;
    }
  }
</style>
