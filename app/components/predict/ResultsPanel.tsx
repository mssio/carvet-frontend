import { fmt } from '../../lib/carvet'
import type { Prediction } from '../../lib/types'
import { Co2BandChip } from '../Co2BandChip'

export type ResultState =
  | { kind: 'result'; prediction: Prediction }
  | { kind: 'pending' }
  | { kind: 'empty' }
  | { kind: 'error'; message: string }

export const EMPTY_MESSAGE = 'No estimate available yet for this vehicle.'
export const ERROR_MESSAGE = 'Something went wrong while estimating. Please try again.'

export function ResultsPanel({
  state,
  previous,
}: {
  state: ResultState
  /** Last shown prediction, kept (dimmed) while a new one is pending. */
  previous: Prediction | null
}) {
  const pending = state.kind === 'pending'
  const shown = state.kind === 'result' ? state.prediction : pending ? previous : null

  return (
    <section
      id="resultsPanel"
      className="card flex flex-col gap-space-md"
      aria-labelledby="resTitle"
      aria-live="polite"
      aria-busy={pending}
    >
      <div className="flex flex-col gap-1">
        <h2 id="resTitle" className="font-headline-sm text-headline-sm">
          Estimate
        </h2>
        <p id="outVehicle" className="font-body-sm text-body-sm text-tertiary">
          {shown?.label}
        </p>
      </div>
      {state.kind === 'empty' || state.kind === 'error' ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant" role={state.kind === 'error' ? 'alert' : undefined}>
          {state.kind === 'empty' ? EMPTY_MESSAGE : state.message}
        </p>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-space-md ${pending ? 'opacity-60' : ''}`}>
          <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <span className="eyebrow">CO₂ emissions</span>
              <span
                title="Bands: under 100 low · 100–165 moderate · 165–225 elevated · over 225 severe (g/km). Dataset mean 274 g/km."
              >
                {shown ? <Co2BandChip gkm={shown.co2} /> : null}
              </span>
            </div>
            <p>
              <span id="outCo2" className="text-display-mobile md:font-display md:text-display tabular-nums">
                {shown ? fmt(shown.co2) : '—'}
              </span>{' '}
              <span className="font-title text-title text-tertiary">g/km</span>
            </p>
            <div className="flex h-2 rounded-full overflow-hidden" aria-hidden="true">
              <span className="flex-1 bg-band-low"></span>
              <span className="flex-1 bg-band-moderate"></span>
              <span className="flex-1 bg-band-elevated"></span>
              <span className="flex-1 bg-band-severe"></span>
            </div>
            <p className="flex justify-between font-label-sm text-label-sm text-tertiary" aria-hidden="true">
              <span>Low</span>
              <span>Severe</span>
            </p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-2">
            <span className="eyebrow">Fuel use</span>
            <p>
              <span id="outFuel" className="text-display-mobile md:font-display md:text-display tabular-nums">
                {shown ? fmt(shown.comb, 1) : '—'}
              </span>{' '}
              <span className="font-title text-title text-tertiary">L/100 km</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white p-2">
                <span className="eyebrow">City</span>
                <p>
                  <span id="outCity" className="font-headline-sm text-headline-sm tabular-nums">
                    {shown ? fmt(shown.city, 1) : '—'}
                  </span>{' '}
                  L/100 km
                </p>
              </div>
              <div className="rounded-lg bg-white p-2">
                <span className="eyebrow">Highway</span>
                <p>
                  <span id="outHwy" className="font-headline-sm text-headline-sm tabular-nums">
                    {shown ? fmt(shown.hwy, 1) : '—'}
                  </span>{' '}
                  L/100 km
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <p className="font-label-sm text-label-sm text-tertiary">Estimate, not an official NRCan rating.</p>
    </section>
  )
}
