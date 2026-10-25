import { useEffect, useState } from 'react'
import { DataDictionary } from '../components/explore/DataDictionary'
import { ExploreCharts } from '../components/explore/ExploreCharts'
import { ExploreFilters } from '../components/explore/ExploreFilters'
import {
  CHART_KEYS,
  classOptions,
  cleanRows,
  deriveView,
  ERROR_STATUS,
  LOADING_STATUS,
  staticCards,
  staticKpis,
} from '../components/explore/explore-view'
import { KpiCards } from '../components/explore/KpiCards'
import { Icon } from '../components/Icon'
import { loadCsv, stats } from '../lib/data'
import type { CsvRow } from '../lib/types'
import type { Route } from './+types/explore'

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'CarVet · Explore' },
    {
      name: 'description',
      content:
        'CarVet — predicting vehicle CO₂ emissions and fuel consumption from specifications, by Team Moneyball.',
    },
  ]
}

const ALL = { fuel: 'all', vehicleClass: 'all' }

export default function Explore() {
  const [rows, setRows] = useState<CsvRow[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [filters, setFilters] = useState(ALL)

  useEffect(() => {
    let cancelled = false
    loadCsv().then(
      (raw) => {
        if (!cancelled) setRows(cleanRows(raw))
      },
      (err) => {
        console.error('Failed to load the vehicle dataset', err)
        if (!cancelled) setFailed(true)
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  // Before the CSV loads (and if it fails) the page shows the stats-based figures.
  const loaded = rows !== null && rows.length > 0
  const view = loaded ? deriveView(rows, filters) : null
  const status = failed
    ? ERROR_STATUS
    : rows === null
      ? LOADING_STATUS
      : (view?.status ?? 'No valid vehicle records were found in combined_output.csv.')

  return (
    <>
      <section className="card rounded-xl p-space-lg md:p-space-xl flex flex-col lg:flex-row gap-space-lg lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 max-w-3xl">
          <span className="chip bg-surface-container-low text-primary w-fit font-code uppercase">Data explorer</span>
          <h1 className="text-headline-xl-mobile md:font-headline-xl md:text-headline-xl">
            Canadian light-duty vehicles, 1995–2026
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            29,215 vehicle configurations from NRCan. Battery-electric and plug-in hybrid vehicles are published separately
            and excluded: they use different rating measures and have no tailpipe CO₂ value.
          </p>
        </div>
        <div className="flex flex-col gap-2 min-w-[220px]">
          <div className="rounded-xl bg-surface-container-low p-3 flex items-center gap-2">
            <Icon name="target" className="text-xl text-primary" />
            <div>
              <span className="eyebrow">Primary target</span>
              <p className="font-title text-title">CO₂ emissions</p>
            </div>
          </div>
        </div>
      </section>

      <KpiCards kpis={view ? view.kpis : staticKpis(stats)} />

      <ExploreFilters
        fuel={filters.fuel}
        vehicleClass={filters.vehicleClass}
        classes={rows ? classOptions(rows) : []}
        resultsSummary={view ? view.resultsSummary : 'Loading vehicle data…'}
        activeFilterSummary={view ? view.activeFilterSummary : 'Preparing charts'}
        status={status}
        onFuel={(fuel) => setFilters({ ...filters, fuel })}
        onClass={(vehicleClass) => setFilters({ ...filters, vehicleClass })}
        onReset={() => setFilters(ALL)}
      />

      <ExploreCharts
        cards={view ? view.cards : staticCards(stats)}
        visible={view ? view.visible : CHART_KEYS}
        chartKey={`${filters.fuel}|${filters.vehicleClass}`}
        showGrid={!failed && (view ? view.visible.length > 0 : true)}
        showEmpty={view !== null && view.visible.length === 0}
      />

      <DataDictionary />
    </>
  )
}
