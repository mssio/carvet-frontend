import type { Kpis } from './explore-view'

const VALUE = 'font-headline-lg text-headline-lg tabular-nums'
const NOTE = 'font-code text-code text-tertiary'

export function KpiCards({ kpis }: { kpis: Kpis }) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-space-md" aria-label="Key figures">
      <div className="card p-4">
        <span className="eyebrow">Records</span>
        <p className={VALUE}>{kpis.records}</p>
      </div>
      <div className="card p-4">
        <span className="eyebrow">Model years</span>
        <p className={VALUE}>{kpis.years}</p>
        <p className={NOTE}>32 years</p>
      </div>
      <div className="card p-4">
        <span className="eyebrow">Makes</span>
        <p className={VALUE}>{kpis.makes}</p>
      </div>
      <div className="card p-4">
        <span className="eyebrow">Vehicle classes</span>
        <p className={VALUE}>{kpis.classes}</p>
      </div>
      <div className="card p-4">
        <span className="eyebrow">Mean CO₂ (g/km)</span>
        <p className={VALUE}>{kpis.co2}</p>
        <p className={NOTE}>{kpis.co2Range}</p>
      </div>
      <div className="card p-4">
        <span className="eyebrow">Mean CO₂ (L/100 km)</span>
        <p className={VALUE}>{kpis.fuel}</p>
        <p className={NOTE}>{kpis.fuelRange}</p>
      </div>
    </section>
  )
}
