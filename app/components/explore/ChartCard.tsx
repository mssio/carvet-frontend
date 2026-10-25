import type { ReactNode } from 'react'
import { Chart } from 'react-chartjs-2'
import './chart-setup'
import type { CardView } from './explore-view'

export function ChartCard({
  view,
  chartKey,
  titleClassName = 'font-title text-title',
  wrapClassName = 'chart-wrap',
  ariaLabel,
  children,
}: {
  view: CardView
  /** Changes on every filter change so each chart is rebuilt, like the mockup's destroyCharts(). */
  chartKey: string
  titleClassName?: string
  wrapClassName?: string
  ariaLabel: string
  children?: ReactNode
}) {
  const { chart } = view
  return (
    <section className="card">
      <span className="eyebrow">{view.eyebrow}</span>
      <h3 className={titleClassName}>
        {view.title}
        {view.r != null && (
          <>
            {' '}
            <span className="chip bg-surface-container-low text-primary">{view.r}</span>
          </>
        )}
      </h3>
      {view.stats !== undefined && <p className="font-code text-code text-tertiary mb-2">{view.stats}</p>}
      <div className={wrapClassName}>
        {chart && (
          <Chart
            key={chartKey}
            type={chart.type}
            data={chart.data as never}
            options={chart.options as never}
            role="img"
            aria-label={ariaLabel}
          />
        )}
      </div>
      {view.note !== undefined && (
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 rounded-lg bg-surface-container-low p-3">
          {view.note}
        </p>
      )}
      {children}
    </section>
  )
}
