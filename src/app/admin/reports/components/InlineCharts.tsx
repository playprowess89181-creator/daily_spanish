'use client';

import { useMemo } from 'react';

export type XYPoint = { x: string; y: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function MiniLineChart(props: {
  points: XYPoint[];
  height?: number;
  stroke?: string;
  fill?: string;
}) {
  const { points, height = 96, stroke = '#2563eb', fill = 'rgba(37, 99, 235, 0.12)' } = props;

  const { path, area, maxY } = useMemo(() => {
    const w = 320;
    const h = height;
    const pad = 8;
    const usableW = w - pad * 2;
    const usableH = h - pad * 2;

    const ys = points.map((p) => p.y);
    const max = Math.max(1, ...ys);

    const coords = points.map((p, i) => {
      const x = pad + (points.length <= 1 ? usableW / 2 : (i / (points.length - 1)) * usableW);
      const y = pad + (1 - p.y / max) * usableH;
      return { x, y };
    });

    const d = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(' ');
    const a = `${d} L ${(pad + usableW).toFixed(2)} ${(pad + usableH).toFixed(2)} L ${pad.toFixed(2)} ${(pad + usableH).toFixed(2)} Z`;
    return { path: d, area: a, maxY: max };
  }, [height, points]);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 320 ${height}`} className="w-full h-24">
        <path d={area} fill={fill} />
        <path d={path} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500">
        <div>{points[0]?.x || ''}</div>
        <div className="font-semibold text-gray-600">{maxY}</div>
        <div>{points[points.length - 1]?.x || ''}</div>
      </div>
    </div>
  );
}

export function BarList(props: {
  rows: Array<{ label: string; value: number }>;
  colorClassName?: string;
}) {
  const { rows, colorClassName = 'bg-blue-600' } = props;
  const max = useMemo(() => Math.max(1, ...rows.map((r) => r.value)), [rows]);

  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const pct = clamp((r.value / max) * 100, 0, 100);
        return (
          <div key={r.label} className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-5 sm:col-span-4 text-sm text-gray-700 truncate" title={r.label}>
              {r.label}
            </div>
            <div className="col-span-5 sm:col-span-6">
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-2.5 rounded-full ${colorClassName}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="col-span-2 text-right text-sm font-semibold text-gray-900">{r.value.toLocaleString()}</div>
          </div>
        );
      })}
    </div>
  );
}

