import { Link } from 'react-router'
import { Co2BandChip } from '../components/Co2BandChip'
import { Icon } from '../components/Icon'
import { annualCost, fmt, formatMoney, vehicleName } from '../lib/carvet'
import { stats } from '../lib/data'
import type { Route } from './+types/home'

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'CarVet · Home' },
    {
      name: 'description',
      content:
        'CarVet — predicting vehicle CO₂ emissions and fuel consumption from specifications, by Team Moneyball.',
    },
  ]
}

const goals = [
  {
    icon: 'leaf',
    title: 'Accelerate fleet decarbonization',
    text: 'Forecast total carbon output across purchasing options and pick configurations that meet corporate ESG targets.',
  },
  {
    icon: 'banknote',
    title: 'Reduce fleet fuel expenses',
    text: 'Estimate annual fuel cost from predicted consumption, expected distance and current fuel prices.',
    formula: 'cost = L/100 km × km ÷ 100 × $/L',
  },
  {
    icon: 'git-compare',
    title: 'Support vehicle purchasing decisions',
    text: 'Help buyers compare expected fuel consumption and CO₂ across configurations.',
  },
  {
    icon: 'history',
    title: 'Benchmark manufacturers over time',
    text: 'Compare emissions across makes, classes and model years to see which manufacturers improve fastest.',
  },
  {
    icon: 'flask-conical',
    title: 'Estimate ratings for untested configurations',
    text: 'Provide a reasonable emissions estimate for new or unusual configurations that have no published government rating yet.',
    wide: true,
  },
] as const

const modelCards = [
  {
    icon: 'cpu',
    title: 'Approach',
    text: 'Supervised regression on seven vehicle specifications, trained on 29,215 NRCan records (1995–2026).',
  },
  {
    icon: 'activity',
    title: 'Maintenance',
    text: 'Vehicle technology shifted 1995–2026 (concept drift). Retrained each year when NRCan publishes a new model year, with planned coverage of the shift to hybrids and EVs.',
  },
  {
    icon: 'users',
    title: 'Fairness',
    text: 'Check that error is not systematically worse for rare makes, small vehicle classes or older model years.',
  },
  {
    icon: 'scale',
    title: 'Licence & privacy',
    text: 'NRCan data under Open Government Licence – Canada. Public, non-personal data; inputs validated and API rate-limited.',
  },
] as const

const codeBox = 'font-code text-code bg-surface-container-low rounded px-2 mt-2'

function Feature({
  kind,
  title,
  value,
  wide = false,
}: {
  kind: string
  title: string
  value: string
  wide?: boolean
}) {
  return (
    <div className={wide ? 'card p-4 sm:col-span-2' : 'card p-4'}>
      <span className="eyebrow">{kind}</span>
      <h3 className="font-title text-title">{title}</h3>
      <p className={codeBox}>{value}</p>
    </div>
  )
}

export default function Home() {
  const r = stats.presets.predict[0].record

  return (
    <>
      {/* [Hero Section] */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          <span className="chip bg-surface-container-low text-primary w-fit font-code uppercase">
            <Icon name="database" /> Built on <span>{fmt(stats.kpis.records)}</span> NRCan records (1995–2026)
          </span>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Official ratings only exist for vehicle configurations that have been tested and published. CarVet estimates
            CO₂ (g/km) and combined fuel consumption (L/100 km) for any configuration from seven specifications —
            helping sustainability teams, buyers and fleet managers compare options before purchase.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/predict" className="btn-primary">
              <Icon name="brain-circuit" /> Try Predict
            </Link>
            <Link to="/explore" className="btn-secondary">
              <Icon name="chart-column" /> Explore the data
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="card p-3">
              <span className="eyebrow">Time span</span>
              <p className="font-title text-title text-primary">32 model years</p>
            </div>
            <div className="card p-3">
              <span className="eyebrow">Inputs</span>
              <p className="font-title text-title text-primary">7 vehicle features</p>
            </div>
          </div>
        </div>
        <aside className="lg:col-span-5 card rounded-xl shadow-lg flex flex-col gap-3" aria-labelledby="exTitle">
          <div className="flex justify-between items-center">
            <span id="exTitle" className="eyebrow">
              Example record
            </span>
            <span className="chip bg-surface-container-low text-tertiary font-code">NRCan data</span>
          </div>
          <div className="rounded-lg bg-surface-container-low p-3">
            <span className="eyebrow">Vehicle</span>
            <p className="font-title text-title">{vehicleName(r)}</p>
            <p className="font-body-sm text-body-sm text-tertiary">
              {`${r.cls} · ${r.engine.toFixed(1)} L · ${r.cyl} cyl · ${r.trans} · fuel ${r.fuel}`}
            </p>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <span className="eyebrow">CO₂</span>
              <p>
                <span className="font-metric-stat text-metric-stat tabular-nums">{fmt(r.co2)}</span> g/km
              </p>
            </div>
            <Co2BandChip gkm={r.co2} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-surface-container-low p-3">
              <span className="eyebrow">Combined fuel</span>
              <p>
                <span className="font-headline-sm text-headline-sm tabular-nums">{fmt(r.comb, 1)}</span> L/100 km
              </p>
            </div>
            <div className="rounded-lg bg-surface-container-low p-3">
              <span className="eyebrow">Fuel cost (20,000 km)</span>
              <p className="font-headline-sm text-headline-sm tabular-nums">
                {formatMoney(annualCost(r.comb, 20000, 1.65))}
              </p>
              <p className="font-code text-code text-tertiary">at $1.65/L</p>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-tertiary">
            Official NRCan rated values for a tested vehicle. For untested configurations, CarVet returns an estimate.
          </p>
        </aside>
      </section>

      {/* [What CarVet helps you do] */}
      <section className="flex flex-col gap-space-md" aria-labelledby="goalsTitle">
        <div>
          <span className="eyebrow">Why CarVet</span>
          <h2 id="goalsTitle" className="font-headline-lg text-headline-lg">
            What CarVet helps you do
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {goals.map((g) => (
            <article key={g.title} className={'wide' in g ? 'card md:col-span-2 lg:col-span-2' : 'card'}>
              <Icon name={g.icon} className="text-2xl text-primary" />
              <h3 className="font-title text-title mt-2">{g.title}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{g.text}</p>
              {'formula' in g && (
                <p className="font-code text-code bg-surface-container-low rounded p-2 mt-2">{g.formula}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* [Governed Powertrain Features Section] */}
      <section className="flex flex-col gap-space-md" aria-labelledby="featTitle">
        <div>
          <span className="eyebrow">How it works</span>
          <h2 id="featTitle" className="font-headline-lg text-headline-lg">
            Seven input features
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Supervised regression. Targets: CO₂ emissions (g/km, primary) and combined fuel consumption (L/100 km).
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <Feature kind="Numeric" title="Model year" value="1995–2026" />
          <Feature kind="Categorical" title="Make" value={`${stats.kpis.makes} makes`} />
          <Feature kind="Categorical" title="Vehicle class" value={`${stats.kpis.classes} NRCan classes`} />
          <Feature
            kind="Numeric"
            title="Engine size"
            value={`${stats.domains.engine.min.toFixed(1)}–${stats.domains.engine.max.toFixed(1)} L`}
          />
          <Feature kind="Numeric" title="Cylinders" value="2–16" />
          <Feature kind="Categorical" title="Transmission" value={`${stats.kpis.transmissions} NRCan codes`} />
          <Feature
            kind="Categorical"
            title="Fuel type"
            value="X regular · Z premium · E ethanol E85 · D diesel · N natural gas"
            wide
          />
        </div>
        <div className="border rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4"></div>
      </section>

      {/* [About the model] */}
      <section className="flex flex-col gap-space-md" aria-labelledby="cardTitle">
        <div className="flex flex-wrap justify-between gap-2 items-end">
          <div>
            <span className="eyebrow">Transparency</span>
            <h2 id="cardTitle" className="font-headline-lg text-headline-lg">
              About the model
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {modelCards.map((c) => (
            <div key={c.title} className="card flex flex-col gap-3">
              <h3 className="flex items-center gap-2 font-title text-title">
                <Icon name={c.icon} className="text-primary" /> {c.title}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* [Interactive Action Banner] */}
      <section className="rounded-xl bg-primary text-on-primary p-space-lg md:p-space-xl flex flex-col md:flex-row md:items-center md:justify-between gap-space-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg">Estimate a vehicle’s emissions</h2>
          <p className="font-body-md text-body-md text-on-primary-container mt-1">
            Enter a vehicle on Predict, compare two side by side, or explore the 29,215-record dataset.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/compare" className="btn-secondary">
            Open Compare <Icon name="arrow-right" />
          </Link>
        </div>
      </section>
    </>
  )
}
