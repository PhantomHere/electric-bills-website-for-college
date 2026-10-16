export interface ChartPoint {
  label: string;
  day: number;
  night: number;
  peak: number;
}

const COLORS = { day: '#1a1a1a', night: '#7eb8da', peak: '#9b8fd9' };
const NAMES = { day: 'Day', night: 'Night', peak: 'Peak' };

// Stacked bars per billing period, drawn as plain SVG — no chart library.
export function ConsumptionChart({ data }: { data: ChartPoint[] }) {
  if (data.length === 0) return null;

  const W = 640, H = 240, L = 44, R = 8, T = 12, B = 30;
  const plotW = W - L - R;
  const plotH = H - T - B;
  const totals = data.map((d) => d.day + d.night + d.peak);
  const rawMax = Math.max(...totals, 1);
  const step = rawMax > 1000 ? 500 : rawMax > 400 ? 100 : rawMax > 100 ? 50 : 10;
  const max = Math.ceil(rawMax / step) * step;
  const scale = plotH / max;
  const slot = plotW / data.length;
  const barW = Math.min(44, slot * 0.6);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const series = (['day', 'night', 'peak'] as const).filter((k) => data.some((d) => d[k] > 0));

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Electricity used per billing period, from ${data[0].label} to ${data[data.length - 1].label}`}
      >
        {ticks.map((t) => {
          const y = T + plotH - t * scale;
          return (
            <g key={t}>
              <line x1={L} x2={W - R} y1={y} y2={y} stroke="#eee" strokeWidth="1" />
              <text x={L - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#999">
                {t}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const x = L + i * slot + (slot - barW) / 2;
          let y = T + plotH;
          return (
            <g key={d.label} className="transition-opacity hover:opacity-80">
              {series.map((k) => {
                const h = d[k] * scale;
                y -= h;
                return (
                  <rect key={k} x={x} y={y} width={barW} height={h} fill={COLORS[k]} rx={k === series[series.length - 1] ? 4 : 0}>
                    <title>{`${d.label} · ${NAMES[k]}: ${d[k]} kWh`}</title>
                  </rect>
                );
              })}
              <text x={x + barW / 2} y={H - 10} textAnchor="middle" fontSize="11" fill="#888">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#666]">
        {series.map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORS[k] }} />
            {NAMES[k]}
          </span>
        ))}
        <span className="ml-auto text-[#999]">kWh per billing period</span>
      </div>
    </div>
  );
}
