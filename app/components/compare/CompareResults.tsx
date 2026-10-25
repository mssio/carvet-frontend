import { annualCost, fmt, vehicleName } from '../../lib/carvet'
import { fuelLabel, transLabel } from '../../lib/vehicle-labels'
import type { VehicleRecord } from '../../lib/types'
import { HBarChart } from '../HBarChart'
import { Icon } from '../Icon'

// Series colours copied verbatim from the mockup (compare.js).
const GREEN = '#2e7d32'
const GREY = '#64748b'

function Verdict({ selected, km, price }: { selected: VehicleRecord[]; km: number | null; price: number | null }) {
  if (selected.length < 2) {
    return <p id="verdict" className="font-headline-md text-headline-md text-white">Add one more car to see which is greener and cheaper.</p>
  }
  const greenest = selected.reduce((a, b) => (b.co2 < a.co2 ? b : a))
  const worst = selected.reduce((a, b) => (b.co2 > a.co2 ? b : a))
  const withCost = selected
    .map((r) => ({ r, c: annualCost(r.comb, km, price) }))
    .filter((x): x is { r: VehicleRecord; c: number } => x.c != null)
  const cheapest = withCost.length ? withCost.reduce((a, b) => (b.c < a.c ? b : a)) : null
  const costliest = withCost.length ? withCost.reduce((a, b) => (b.c > a.c ? b : a)) : null

  // Quantify the gap so the user sees the real-world payoff, not just a name.
  const co2Drop = worst.co2 > 0 ? Math.round(((worst.co2 - greenest.co2) / worst.co2) * 100) : 0
  const saveYr = cheapest && costliest ? costliest.c - cheapest.c : 0
  const sameWinner = cheapest && greenest === cheapest.r
  const gName = vehicleName(greenest)
  const cName = cheapest ? vehicleName(cheapest.r) : '—'
  const headline = sameWinner ? `🏆 ${gName} — greenest & cheapest to run` : `🌱 ${gName} is greenest  ·  💰 ${cName} is cheapest to run`

  return (
    <p id="verdict">
      <span className="block font-headline-md text-headline-md text-white">{headline}</span>
      {(co2Drop > 0 || saveYr > 0) && (
        <span className="flex flex-wrap gap-2 mt-3">
          {co2Drop > 0 && (
            <span className="chip bg-white text-on-surface" title="Lowest vs highest CO₂ in this comparison">
              {`🌱 ${co2Drop}% less CO₂`}
            </span>
          )}
          {saveYr > 0 && (
            <span className="chip bg-white text-on-surface" title="Yearly fuel-cost gap between the cheapest and most expensive car">
              {`💰 Save $${fmt(saveYr)} / year`}
            </span>
          )}
          {saveYr > 0 && <span className="chip bg-white text-on-surface">{`📅 $${fmt(saveYr * 5)} over 5 years`}</span>}
        </span>
      )}
    </p>
  )
}

export function CompareResults({ selected, km, price }: { selected: VehicleRecord[]; km: number | null; price: number | null }) {
  const minCo2 = Math.min(...selected.map((r) => r.co2))
  const cost = (r: VehicleRecord) => {
    const c = annualCost(r.comb, km, price)
    return c == null ? '—' : `$${fmt(c)}`
  }
  const specs: [string, (r: VehicleRecord) => string | number][] = [
    ['CO₂ (g/km)', (r) => r.co2],
    ['Fuel combined (L/100km)', (r) => r.comb.toFixed(1)],
    ['Fuel / year', cost],
    ['Engine (L)', (r) => r.engine.toFixed(1)],
    ['Cylinders', (r) => r.cyl],
    ['Transmission', (r) => transLabel(r.trans)],
    ['Fuel type', (r) => fuelLabel(r.fuel)],
    ['Class', (r) => r.cls],
  ]
  return (
    <>
      <section
        id="resultSection"
        className="rounded-xl bg-primary-container p-space-lg flex flex-col justify-center gap-2"
        style={{ minHeight: '150px' }}
      >
        <span className="eyebrow text-on-primary-container">Result</span>
        <Verdict selected={selected} km={km} price={price} />
      </section>

      <section id="chartSection" className="card">
        <span className="eyebrow">CO₂ emissions — lower is better</span>
        <h2 className="font-title text-title mb-3 flex items-center gap-2">
          <Icon name="leaf" className="text-primary text-xl" /> Carbon emissions by car
        </h2>
        <div id="chartCompare">
          <HBarChart
            unit="g/km"
            items={selected.map((r) => ({
              label: `${r.make} ${r.model}`,
              value: r.co2,
              color: selected.length >= 2 && r.co2 === minCo2 ? GREEN : GREY,
            }))}
          />
        </div>
      </section>

      <details id="detailsSection" className="card">
        <summary className="font-title text-title cursor-pointer">See full specs</summary>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left">
            <tbody id="specTable">
              <tr className="eyebrow">
                <th className="p-2 text-left">Spec</th>
                {selected.map((r, i) => (
                  <th key={i} className="p-2 text-left">{`${r.make} ${r.model}`}</th>
                ))}
              </tr>
              {specs.map(([label, get]) => (
                <tr key={label} className="border-t border-slate-100">
                  <td className="p-2 font-label-md text-label-md">{label}</td>
                  {selected.map((r, i) => (
                    <td key={i} className="p-2 tabular-nums">
                      {get(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  )
}
