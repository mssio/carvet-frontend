import { ChartCard } from './ChartCard'
import type { CardView, ChartKey } from './explore-view'

const TITLE_MB = 'font-title text-title mb-3'

export function ExploreCharts({
  cards,
  visible,
  chartKey,
  showGrid,
  showEmpty,
}: {
  cards: Partial<Record<ChartKey, CardView>>
  visible: ChartKey[]
  chartKey: string
  showGrid: boolean
  showEmpty: boolean
}) {
  const card = (key: ChartKey) => (visible.includes(key) ? cards[key] : undefined)
  const co2Hist = card('co2Hist')
  const fuelHist = card('fuelHist')
  const trend = card('trend')
  const byClass = card('class')
  const fuel = card('fuel')
  const scatter = card('scatter')
  return (
    <section aria-label="Vehicle data visualizations" className="flex flex-col gap-space-md">
      {showGrid && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          {co2Hist && <ChartCard view={co2Hist} chartKey={chartKey} ariaLabel="Histogram of CO2 emissions" />}
          {fuelHist && (
            <ChartCard view={fuelHist} chartKey={chartKey} ariaLabel="Histogram of combined fuel consumption" />
          )}
          {trend && (
            <ChartCard
              view={trend}
              chartKey={chartKey}
              wrapClassName="chart-wrap chart-wrap-wide"
              ariaLabel="Mean CO2 emissions and engine size by model year"
            />
          )}
          {byClass && (
            <ChartCard
              view={byClass}
              chartKey={chartKey}
              titleClassName={TITLE_MB}
              wrapClassName="chart-wrap chart-wrap-tall"
              ariaLabel="Mean CO2 emissions by vehicle class"
            />
          )}
          {fuel && (
            <ChartCard
              view={fuel}
              chartKey={chartKey}
              titleClassName={TITLE_MB}
              wrapClassName="chart-wrap chart-wrap-tall"
              ariaLabel="Record count and mean CO2 by fuel type"
            />
          )}
          {scatter && (
            <ChartCard view={scatter} chartKey={chartKey} ariaLabel="Scatter plot of engine size and CO2 emissions">
              <p className="font-body-sm text-body-sm text-tertiary mt-2">
                Displays up to 800 records, selected deterministically for readability.
              </p>
            </ChartCard>
          )}
        </div>
      )}
      {showEmpty && (
        <div className="card text-center" role="status">
          <h3 className="font-title text-title">No matching vehicles</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
            Try another fuel type or vehicle class, or reset the filters.
          </p>
        </div>
      )}
    </section>
  )
}
