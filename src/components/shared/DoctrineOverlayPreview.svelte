<script lang="ts">
  import { getChartPriceRange, getHistoricalChartFrame } from '$lib/engine/chart-frame-model';
  import type { OverlaySpec, OverlayTone } from '$lib/types';

  let { overlaySpec, frameId }: { overlaySpec: OverlaySpec; frameId: string } = $props();

  const frame = $derived(frameId ? getHistoricalChartFrame(frameId) : null);
  const candles = $derived(frame?.candles ?? []);
  const chartBounds = { left: 36, top: 22, width: 568, height: 178 };

  function tonePalette(tone: OverlayTone) {
    switch (tone) {
      case 'BULL':
        return { fill: 'rgba(89, 170, 116, 0.18)', stroke: '#4e9d69', text: '#26503a' };
      case 'BEAR':
        return { fill: 'rgba(188, 84, 84, 0.16)', stroke: '#aa5d58', text: '#6f302e' };
      case 'WARN':
        return { fill: 'rgba(213, 163, 83, 0.18)', stroke: '#b78534', text: '#6a4919' };
      case 'INFO':
        return { fill: 'rgba(88, 126, 185, 0.18)', stroke: '#587eb9', text: '#294669' };
      default:
        return { fill: 'rgba(122, 130, 151, 0.16)', stroke: '#7a8297', text: '#495165' };
    }
  }

  const candleShapes = $derived.by(() => {
    if (candles.length === 0) {
      return [];
    }

    const range = getChartPriceRange(candles);
    const spread = Math.max(1, range.max - range.min);
    const step = chartBounds.width / candles.length;
    const candleWidth = Math.max(10, step * 0.56);

    const yForPrice = (price: number) => chartBounds.top + ((range.max - price) / spread) * chartBounds.height;

    return candles.map((candle, index) => {
      const centerX = chartBounds.left + step * index + step / 2;
      const openY = yForPrice(candle.open);
      const closeY = yForPrice(candle.close);
      const highY = yForPrice(candle.high);
      const lowY = yForPrice(candle.low);
      const bullish = candle.close >= candle.open;

      return {
        id: `${frameId}-candle-${index}`,
        bullish,
        centerX,
        wickTop: highY,
        wickBottom: lowY,
        bodyY: Math.min(openY, closeY),
        bodyHeight: Math.max(4, Math.abs(closeY - openY)),
        bodyX: centerX - candleWidth / 2,
        bodyWidth: candleWidth,
      };
    });
  });

  const overlayShapes = $derived.by(() => {
    const totalLayers = Math.max(overlaySpec.layers.length, 1);
    const slotWidth = chartBounds.width / totalLayers;

    return overlaySpec.layers.map((layer, index) => {
      const palette = tonePalette(layer.tone);
      const slotLeft = chartBounds.left + slotWidth * index;
      const slotCenter = slotLeft + slotWidth / 2;

      if (layer.kind === 'ZONE') {
        const zoneHeight = chartBounds.height * 0.34;
        const zoneY = layer.tone === 'BEAR' ? chartBounds.top + chartBounds.height * 0.16 : chartBounds.top + chartBounds.height * 0.5;
        return {
          id: layer.id,
          kind: layer.kind,
          label: layer.label,
          x: slotLeft + 8,
          y: zoneY,
          width: Math.max(76, slotWidth - 16),
          height: zoneHeight,
          palette,
        };
      }

      if (layer.kind === 'BAND') {
        const y = chartBounds.top + chartBounds.height * (0.25 + (index % 3) * 0.22);
        return {
          id: layer.id,
          kind: layer.kind,
          label: layer.label,
          x1: chartBounds.left,
          x2: chartBounds.left + chartBounds.width,
          y,
          palette,
        };
      }

      if (layer.kind === 'MARKER') {
        return {
          id: layer.id,
          kind: layer.kind,
          label: layer.label,
          x: slotCenter,
          y1: chartBounds.top + 8,
          y2: chartBounds.top + chartBounds.height - 8,
          palette,
        };
      }

      return {
        id: layer.id,
        kind: layer.kind,
        label: layer.label,
        x: slotLeft + 12,
        y: chartBounds.top + 10 + (index % 2) * 26,
        width: Math.max(94, slotWidth - 18),
        height: 22,
        palette,
      };
    });
  });
</script>

<div class="preview-shell">
  <div class="preview-head">
    <div>
      <small>Overlay preview</small>
      <strong>{overlaySpec.title}</strong>
    </div>
    {#if frame}
      <div class="preview-meta">
        <span>{frame.title}</span>
        <span>{frame.dateLabel}</span>
      </div>
    {/if}
  </div>

  {#if frame && candles.length > 0}
    <svg class="preview-chart" viewBox="0 0 640 228" aria-label={`${overlaySpec.title} preview`}>
      <rect x="0" y="0" width="640" height="228" rx="18" fill="#f4efe4" />

      {#each [0.2, 0.5, 0.8] as ratio}
        <line
          x1={chartBounds.left}
          x2={chartBounds.left + chartBounds.width}
          y1={chartBounds.top + chartBounds.height * ratio}
          y2={chartBounds.top + chartBounds.height * ratio}
          stroke="rgba(80, 67, 46, 0.12)"
          stroke-width="1"
        />
      {/each}

      {#each overlayShapes as shape}
        {#if shape.kind === 'ZONE'}
          <rect
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            rx="12"
            fill={shape.palette.fill}
            stroke={shape.palette.stroke}
            stroke-width="2"
          />
          <text x={shape.x + 10} y={shape.y + 20} fill={shape.palette.text} font-size="11" font-weight="700">
            {shape.label}
          </text>
        {:else if shape.kind === 'BAND'}
          <line
            x1={shape.x1}
            x2={shape.x2}
            y1={shape.y}
            y2={shape.y}
            stroke={shape.palette.stroke}
            stroke-width="4"
            stroke-linecap="round"
            opacity="0.7"
          />
          <text x={chartBounds.left + 6} y={shape.y - 8} fill={shape.palette.text} font-size="11" font-weight="700">
            {shape.label}
          </text>
        {:else if shape.kind === 'MARKER'}
          <line
            x1={shape.x}
            x2={shape.x}
            y1={shape.y1}
            y2={shape.y2}
            stroke={shape.palette.stroke}
            stroke-width="2"
            stroke-dasharray="6 6"
          />
          <text x={shape.x + 8} y={shape.y1 + 16} fill={shape.palette.text} font-size="11" font-weight="700">
            {shape.label}
          </text>
        {:else}
          <rect
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            rx="8"
            fill={shape.palette.fill}
            stroke={shape.palette.stroke}
            stroke-width="1.5"
          />
          <text x={shape.x + 10} y={shape.y + 15} fill={shape.palette.text} font-size="10.5" font-weight="700">
            {shape.label}
          </text>
        {/if}
      {/each}

      {#each candleShapes as candle}
        <line
          x1={candle.centerX}
          x2={candle.centerX}
          y1={candle.wickTop}
          y2={candle.wickBottom}
          stroke={candle.bullish ? '#4e9d69' : '#b55b52'}
          stroke-width="2"
          stroke-linecap="round"
        />
        <rect
          x={candle.bodyX}
          y={candle.bodyY}
          width={candle.bodyWidth}
          height={candle.bodyHeight}
          rx="2"
          fill={candle.bullish ? '#79bb83' : '#c67a72'}
          stroke={candle.bullish ? '#4e9d69' : '#aa5d58'}
          stroke-width="1.4"
        />
      {/each}

      <text x="40" y="214" fill="#7a6850" font-size="11">{overlaySpec.summary}</text>
    </svg>
  {:else}
    <div class="preview-empty">
      <p>No historical frame is available for this overlay preview yet.</p>
    </div>
  {/if}
</div>

<style>
  .preview-shell {
    display: grid;
    gap: 12px;
  }

  .preview-head {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: flex-start;
  }

  .preview-head small,
  .preview-meta {
    color: var(--text-soft);
  }

  .preview-head strong,
  .preview-meta span {
    display: block;
  }

  .preview-chart {
    width: 100%;
    display: block;
    border-radius: 18px;
    box-shadow: inset 0 0 0 1px rgba(103, 82, 57, 0.08);
  }

  .preview-meta {
    text-align: right;
    font-size: 0.82rem;
    line-height: 1.5;
  }

  .preview-empty {
    border: 1px dashed var(--border);
    border-radius: 16px;
    padding: 18px;
    color: var(--text-soft);
  }

  @media (max-width: 760px) {
    .preview-head {
      flex-direction: column;
      align-items: flex-start;
    }

    .preview-meta {
      text-align: left;
    }
  }
</style>
