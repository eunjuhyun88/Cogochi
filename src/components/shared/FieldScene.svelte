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
  import type { FieldState, OwnedAgent } from '$lib/types';

  let {
    state: fieldState,
    agents,
    runtimeCueNodeId = null,
    runtimeCueVerb = null,
  }: {
    state: FieldState;
    agents: OwnedAgent[];
    runtimeCueNodeId?: string | null;
    runtimeCueVerb?: string | null;
  } = $props();
  const chartPadding = {
    top: 112,
    right: chartFieldPadding.right,
    bottom: 176,
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
    const innerTop = frame.y + 94;
    const innerBottom = frame.y + frame.height - 84;
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
  const leaderFrameIndex = $derived.by(() => {
    if (!leader || fieldFrames.length === 0) {
      return 0;
    }
    return resolveHistoricalFieldFrameIndex(leader.x, fieldState.width);
  });
  const cameraZoom = $derived.by(() => {
    if (!browser) {
      return 1.14;
    }
    if (viewportWidth <= 480) {
      return 1.48;
    }
    if (viewportWidth <= 768) {
      return 1.34;
    }
    if (viewportWidth <= 1100) {
      return 1.22;
    }
    if (viewportWidth <= 1440) {
      return 1.14;
    }
    return 1.08;
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
    x: Math.min(visibleWorld.width * 0.1, 112),
    y: Math.min(visibleWorld.height * 0.18, 136),
  }));
  const lookAhead = $derived.by(() => {
    if (!leader || !leader.moving) {
      return { x: 0, y: 0 };
    }
    const horizontal = Math.min(visibleWorld.width * 0.18, 180);
    const vertical = Math.min(visibleWorld.height * 0.14, 132);
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
          <line
            class="field-scene__wick"
            stroke={candleColor(candle)}
            x1={frameCandleX(frame, candleIndex, frame.candles.length)}
            x2={frameCandleX(frame, candleIndex, frame.candles.length)}
            y1={frameInnerY(frame, candle.high, frame.priceRange.min, frame.priceRange.max)}
            y2={frameInnerY(frame, candle.low, frame.priceRange.min, frame.priceRange.max)}
          ></line>
          <rect
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
    border: 1px solid rgba(169, 171, 134, 0.28);
    background:
      radial-gradient(circle at top left, rgba(255, 234, 171, 0.92), transparent 30%),
      linear-gradient(180deg, rgba(231, 244, 255, 0.98), rgba(241, 234, 205, 0.98) 56%, rgba(194, 219, 180, 0.98));
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.32),
      0 22px 50px rgba(97, 95, 59, 0.18);
  }

  .field-scene__sun {
    position: absolute;
    top: 22px;
    right: 52px;
    width: 136px;
    height: 136px;
    border-radius: 999px;
    background:
      radial-gradient(circle, rgba(255, 252, 220, 0.98) 0 28%, rgba(255, 223, 145, 0.94) 29% 58%, rgba(255, 223, 145, 0) 59% 100%);
    opacity: 0.82;
    pointer-events: none;
    filter: blur(0.4px);
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
      radial-gradient(circle at 22% 18%, rgba(255, 246, 204, 0.56), transparent 22%),
      radial-gradient(circle at 72% 16%, rgba(187, 223, 188, 0.3), transparent 22%),
      linear-gradient(180deg, rgba(206, 231, 248, 0.98) 0%, rgba(214, 236, 238, 0.98) 28%, rgba(188, 216, 176, 0.96) 60%, rgba(160, 198, 132, 0.96) 100%);
  }

  .field-world__grid {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(88, 103, 68, 0.08)),
      repeating-linear-gradient(
        to right,
        rgba(127, 164, 131, 0.04) 0,
        rgba(127, 164, 131, 0.04) 59px,
        rgba(127, 164, 131, 0.09) 59px,
        rgba(127, 164, 131, 0.09) 60px
      ),
      repeating-linear-gradient(
        to bottom,
        rgba(127, 164, 131, 0.04) 0,
        rgba(127, 164, 131, 0.04) 59px,
        rgba(127, 164, 131, 0.08) 59px,
        rgba(127, 164, 131, 0.08) 60px
      );
    opacity: 0.34;
  }

  .field-scene__skyline {
    position: absolute;
    inset: auto 0 0;
    height: 44%;
    background:
      radial-gradient(circle at 14% 32%, rgba(255, 235, 166, 0.22), transparent 18%),
      linear-gradient(180deg, rgba(125, 153, 112, 0), rgba(124, 161, 103, 0.22) 28%, rgba(108, 141, 84, 0.7) 100%);
  }

  .field-cloud {
    position: absolute;
    border-radius: 999px;
    background:
      radial-gradient(circle at 28% 48%, rgba(255, 255, 255, 0.92) 0 24%, transparent 25%),
      radial-gradient(circle at 48% 42%, rgba(255, 255, 255, 0.94) 0 30%, transparent 31%),
      radial-gradient(circle at 68% 50%, rgba(255, 255, 255, 0.9) 0 24%, transparent 25%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(230, 240, 244, 0.68));
    opacity: 0.86;
    filter: drop-shadow(0 10px 12px rgba(130, 156, 167, 0.12));
  }

  .field-scene__chart {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.92;
  }

  .field-scene__frame {
    stroke: rgba(98, 105, 73, 0.22);
    stroke-width: 2;
    filter: drop-shadow(0 10px 18px rgba(115, 126, 87, 0.12));
  }

  .field-scene__frame--bull {
    fill: rgba(211, 235, 205, 0.34);
  }

  .field-scene__frame--bear {
    fill: rgba(240, 221, 205, 0.3);
  }

  .field-scene__frame--flat {
    fill: rgba(241, 236, 214, 0.32);
  }

  .field-scene__frame.active {
    stroke: rgba(214, 173, 82, 0.58);
    fill: rgba(245, 227, 168, 0.22);
  }

  .field-scene__terrain {
    fill: none;
    stroke-width: 86;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.94;
  }

  .field-scene__terrain--bull {
    stroke: rgba(137, 184, 114, 0.52);
  }

  .field-scene__terrain--bear {
    stroke: rgba(190, 154, 109, 0.44);
  }

  .field-scene__terrain--flat {
    stroke: rgba(190, 181, 138, 0.42);
  }

  .field-scene__frame-date {
    fill: rgba(92, 109, 83, 0.74);
    font-size: 20px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .field-scene__frame-title {
    fill: rgba(51, 68, 43, 0.9);
    font-size: 26px;
    font-weight: 700;
  }

  .field-scene__chart-line {
    stroke: rgba(68, 138, 117, 0.74);
    stroke-width: 10;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: drop-shadow(0 2px 8px rgba(77, 134, 116, 0.16));
  }

  .field-scene__route-shadow,
  .field-scene__route-bed,
  .field-scene__route-center {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .field-scene__route-shadow {
    stroke: rgba(95, 74, 35, 0.18);
    stroke-width: 78;
  }

  .field-scene__route-bed {
    stroke: rgba(241, 224, 173, 0.94);
    stroke-width: 58;
    filter: drop-shadow(0 14px 18px rgba(121, 99, 53, 0.16));
  }

  .field-scene__route-center {
    stroke: rgba(185, 133, 56, 0.62);
    stroke-width: 8;
    stroke-dasharray: 16 18;
    animation: route-center-flow 4s linear infinite;
  }

  .field-scene__route-stop {
    fill: rgba(255, 248, 226, 0.92);
    stroke: rgba(183, 145, 75, 0.46);
    stroke-width: 4;
  }

  .field-scene__route-stop.objective {
    fill: rgba(253, 232, 184, 0.98);
  }

  .field-scene__route-stop.runtimeCue {
    fill: rgba(244, 240, 201, 0.98);
    filter: drop-shadow(0 0 12px rgba(245, 223, 153, 0.28));
  }

  .field-scene__cue-guide {
    fill: none;
    stroke: rgba(201, 160, 78, 0.58);
    stroke-width: 8;
    stroke-linecap: round;
    stroke-dasharray: 18 14;
    filter: drop-shadow(0 0 14px rgba(244, 223, 150, 0.12));
    animation: cue-guide-flow 2.4s linear infinite;
  }

  .field-scene__wick {
    stroke-width: 5;
    stroke-linecap: round;
    opacity: 0.84;
  }

  .field-prop {
    position: absolute;
    z-index: 1;
    pointer-events: none;
  }

  .field-prop--tuft {
    border-radius: 999px 999px 12px 12px;
    background:
      radial-gradient(circle at 28% 88%, rgba(72, 134, 84, 0.9) 0 18%, transparent 19%),
      radial-gradient(circle at 50% 26%, rgba(139, 189, 107, 0.96) 0 28%, transparent 29%),
      radial-gradient(circle at 74% 88%, rgba(72, 134, 84, 0.9) 0 18%, transparent 19%);
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
      linear-gradient(180deg, rgba(130, 129, 113, 0.94), rgba(96, 96, 82, 0.94));
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.26),
      0 6px 12px rgba(82, 80, 60, 0.16);
  }

  .field-barrier {
    position: absolute;
    border-radius: 24px;
    border: 1px solid rgba(85, 89, 63, 0.18);
    box-sizing: border-box;
    overflow: hidden;
    opacity: 0.58;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.22),
      0 10px 20px rgba(96, 97, 59, 0.12);
  }

  .field-barrier--support {
    background:
      linear-gradient(
        180deg,
        rgba(204, 235, 164, 0.98) 0 12%,
        rgba(122, 170, 102, 0.72) 12% 20%,
        rgba(110, 90, 58, 0.24) 20% 34%,
        rgba(110, 90, 58, 0.04) 34% 48%,
        rgba(110, 90, 58, 0) 48% 100%
      );
    clip-path: polygon(0 34%, 10% 24%, 22% 18%, 35% 22%, 49% 16%, 64% 20%, 79% 18%, 92% 24%, 100% 32%, 100% 100%, 0 100%);
  }

  .field-barrier--pit {
    background:
      radial-gradient(circle at top, rgba(248, 186, 91, 0.62), transparent 28%),
      linear-gradient(180deg, rgba(86, 63, 37, 0.84), rgba(42, 28, 15, 0.98));
    border-color: rgba(139, 97, 55, 0.32);
  }

  .field-barrier--resistance {
    background:
      repeating-linear-gradient(
        180deg,
        rgba(214, 159, 97, 0.94) 0,
        rgba(214, 159, 97, 0.94) 18px,
        rgba(167, 108, 52, 0.98) 18px,
        rgba(167, 108, 52, 0.98) 36px
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
      radial-gradient(circle, rgba(115, 92, 48, 0.2) 0 36%, rgba(115, 92, 48, 0.04) 37% 72%, transparent 73% 100%),
      rgba(112, 152, 88, 0.2);
    filter: blur(0.4px);
  }

  .field-node__stem {
    position: absolute;
    inset: 34px auto auto 50%;
    width: 6px;
    height: 50px;
    margin-left: -3px;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(111, 84, 44, 0.98), rgba(150, 122, 64, 0.18));
    opacity: 0.76;
  }

  .field-node__pulse {
    position: absolute;
    inset: 0 auto auto 50%;
    width: 32px;
    height: 32px;
    margin-left: -16px;
    border-radius: 999px;
    background: rgba(230, 215, 154, 0.22);
    box-shadow: 0 0 0 12px rgba(230, 215, 154, 0.08);
  }

  .field-node__core {
    position: absolute;
    inset: 0 auto auto 50%;
    width: 52px;
    height: 40px;
    margin-left: -26px;
    border-radius: 16px;
    background:
      linear-gradient(180deg, rgba(255, 249, 233, 0.94), rgba(227, 212, 162, 0.92));
    border: 1px solid rgba(145, 118, 58, 0.24);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      0 8px 24px rgba(114, 92, 42, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.34);
  }

  .field-node__beam {
    position: absolute;
    inset: -110px auto auto 50%;
    width: 12px;
    height: 124px;
    margin-left: -6px;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(246, 232, 168, 0), rgba(246, 232, 168, 0.78) 52%, rgba(246, 232, 168, 0));
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
    background: rgba(255, 248, 232, 0.92);
    color: rgba(98, 76, 37, 0.96);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-align: center;
    text-transform: uppercase;
    box-shadow: 0 10px 22px rgba(127, 102, 50, 0.16);
  }

  .field-node__label {
    position: absolute;
    inset: 100% auto auto 50%;
    transform: translate(-50%, 6px);
    min-width: max-content;
    max-width: 120px;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(255, 250, 236, 0.94);
    border: 1px solid rgba(175, 143, 80, 0.22);
    color: rgba(88, 70, 32, 0.92);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-align: center;
    white-space: nowrap;
    box-shadow: 0 8px 20px rgba(110, 89, 44, 0.14);
  }

  .field-node__core span {
    color: rgba(89, 71, 31, 0.92);
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.06em;
  }

  .field-node.active {
    filter: drop-shadow(0 0 12px rgba(164, 198, 100, 0.36));
  }

  .field-node.active .field-node__core {
    border-color: rgba(110, 165, 84, 0.46);
    background: linear-gradient(180deg, rgba(243, 250, 231, 0.96), rgba(209, 232, 179, 0.94));
  }

  .field-node.objective .field-node__core {
    border-color: rgba(198, 153, 68, 0.44);
    background: linear-gradient(180deg, rgba(255, 247, 228, 0.98), rgba(242, 215, 156, 0.94));
  }

  .field-node.objective .field-node__pulse {
    background: rgba(245, 223, 153, 0.24);
    box-shadow: 0 0 0 10px rgba(245, 223, 153, 0.08);
  }

  .field-node.runtimeCue {
    filter: drop-shadow(0 0 18px rgba(245, 223, 153, 0.28));
  }

  .field-node.runtimeCue .field-node__core {
    border-color: rgba(214, 170, 78, 0.58);
    background: linear-gradient(180deg, rgba(255, 251, 234, 0.98), rgba(247, 221, 160, 0.95));
    box-shadow:
      0 12px 26px rgba(118, 89, 31, 0.22),
      inset 0 0 0 1px rgba(245, 223, 153, 0.16);
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
    opacity: 0.56;
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
    background: linear-gradient(180deg, rgba(248, 231, 177, 0.98), rgba(227, 183, 85, 0.96));
    box-shadow: 0 0 0 8px rgba(248, 231, 177, 0.1);
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
