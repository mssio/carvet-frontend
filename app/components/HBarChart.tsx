export interface HBarItem {
  label: string
  value: number
  color: string
}

/** Horizontal bar chart. Port of `hbars` in the mockup's charts.js (bars drawn as SVG). */
export function HBarChart({ unit, items }: { unit: string; items: HBarItem[] }) {
  const max = Math.max(...items.map((i) => i.value)) || 1
  return (
    <>
      {items.map((it, i) => {
        const pct = Math.round((it.value / max) * 1000) / 10
        // Keyed by position: labels need not be unique (same make+model, different year).
        return (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex justify-between gap-2 font-body-sm text-body-sm">
              <span className="text-on-surface">{it.label}</span>
              <span className="font-code text-code tabular-nums">
                {it.value} {unit}
              </span>
            </div>
            <svg className="block w-full h-2.5" role="img" aria-label={`${it.label}: ${it.value} ${unit}`}>
              <rect className="fill-surface-container" x="0" y="0" width="100%" height="10" rx="5" />
              <rect data-bar width={`${pct}%`} height="10" rx="5" fill={it.color} />
            </svg>
          </div>
        )
      })}
    </>
  )
}
