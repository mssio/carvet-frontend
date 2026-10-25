import { annualCost, fmt } from '../../lib/carvet'
import { carImage, fuelLabel, transLabel } from '../../lib/vehicle-labels'
import type { VehicleRecord } from '../../lib/types'
import { Icon } from '../Icon'

export function CarCards({
  selected,
  km,
  price,
  onRemove,
}: {
  selected: VehicleRecord[]
  km: number | null
  price: number | null
  onRemove: (index: number) => void
}) {
  if (!selected.length) {
    return (
      <div className="card text-center sm:col-span-2">
        <Icon name="git-compare" className="text-primary" />
        <p className="font-body-md text-body-md text-tertiary mt-2">No cars yet — use the selector above to add your first car.</p>
      </div>
    )
  }
  const minCo2 = Math.min(...selected.map((r) => r.co2))
  return selected.map((r, i) => {
    const win = selected.length >= 2 && r.co2 === minCo2
    const cost = annualCost(r.comb, km, price)
    return (
      <div key={i} className={"card flex flex-col gap-2 relative"}>
        {win && <span className="chip chip-low absolute">Greenest ✓</span>}
        <img src={carImage(r.cls)} alt={r.cls} className="w-full" />
        <h3 className="font-title text-title">{`${r.year} ${r.make}`}</h3>
        <p className="font-body-sm text-body-sm text-tertiary">{r.model}</p>
        <div className="metric-box box-co2 mt-1">
          <span className="eyebrow">CO₂ emissions</span>
          <p>
            <span className={`text-display-mobile tabular-nums ${win ? 'text-primary' : ''}`}>{r.co2}</span>{' '}
            <span className="text-tertiary">g/km</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="metric-box box-fuel">
            <span className="eyebrow">Fuel use</span>
            <p className="font-title text-title tabular-nums">
              {r.comb.toFixed(1)} <span className="font-body-sm text-tertiary">L/100km</span>
            </p>
          </div>
          <div className="metric-box box-cost">
            <span className="eyebrow">Fuel / year</span>
            <p className="font-title text-title tabular-nums">{cost == null ? '—' : `$${fmt(cost)}`}</p>
          </div>
        </div>
        <p className="font-body-sm text-body-sm text-tertiary flex-1">
          {`${r.cls} · ${r.engine.toFixed(1)}L · ${r.cyl}cyl · ${transLabel(r.trans)} · ${fuelLabel(r.fuel)}`}
        </p>
        <button type="button" className="btn-secondary mt-2 w-full" onClick={() => onRemove(i)}>
          <Icon name="x" /> Remove
        </button>
      </div>
    )
  })
}
