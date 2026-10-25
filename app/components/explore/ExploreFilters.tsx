import { Icon } from '../Icon'
import { EXPLORE_FUEL_LABELS } from './explore-view'

export function ExploreFilters({
  fuel,
  vehicleClass,
  classes,
  resultsSummary,
  activeFilterSummary,
  status,
  onFuel,
  onClass,
  onReset,
}: {
  fuel: string
  vehicleClass: string
  classes: string[]
  resultsSummary: string
  activeFilterSummary: string
  status: string
  onFuel: (fuel: string) => void
  onClass: (vehicleClass: string) => void
  onReset: () => void
}) {
  return (
    <section className="card flex flex-col gap-space-md" aria-label="Filters">
      <div className="flex flex-col md:flex-row md:items-end gap-space-md">
        <p className="flex items-center gap-2 font-label-md text-label-md" style={{ lineHeight: '40px' }}>
          <Icon name="sliders-horizontal" className="text-primary" /> Filters
        </p>
        <label className="flex-1 flex flex-col gap-1 font-label-sm text-label-sm text-tertiary">
          Fuel type
          <select className="field" aria-label="Filter by fuel type" value={fuel} onChange={(e) => onFuel(e.target.value)}>
            <option value="all">All fuel types</option>
            {Object.entries(EXPLORE_FUEL_LABELS).map(([code, label]) => (
              <option key={code} value={code}>{`${code} - ${label}`}</option>
            ))}
          </select>
        </label>
        <label className="flex-1 flex flex-col gap-1 font-label-sm text-label-sm text-tertiary">
          Vehicle class
          <select
            className="field"
            aria-label="Filter by vehicle class"
            value={vehicleClass}
            onChange={(e) => onClass(e.target.value)}
          >
            <option value="all">All classes</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="reset-filters btn-primary py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          onClick={onReset}
        >
          Reset filters
        </button>
      </div>
      <div className="rounded-lg bg-surface-container-low p-3 flex flex-col gap-2" aria-live="polite">
        <p className="font-label-md text-label-md">{resultsSummary}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{activeFilterSummary}</p>
      </div>
      <p className="font-body-sm text-body-sm text-tertiary" role="status">
        {status}
      </p>
    </section>
  )
}
