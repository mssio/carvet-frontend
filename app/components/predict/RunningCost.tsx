import { annualCo2Tonnes, annualCost, fmt, formatMoney, toNumber } from '../../lib/carvet'
import type { Prediction } from '../../lib/types'

export function RunningCost({
  prediction,
  km,
  price,
  onKmChange,
  onPriceChange,
}: {
  /** Current result, or null while empty, errored or pending (outputs show —). */
  prediction: Prediction | null
  km: string
  price: string
  onKmChange: (v: string) => void
  onPriceChange: (v: string) => void
}) {
  const kmN = toNumber(km)
  const priceN = toNumber(price)
  const cost = prediction ? annualCost(prediction.comb, kmN, priceN) : null
  const co2T = prediction ? annualCo2Tonnes(prediction.co2, kmN) : null

  return (
    <section className="card flex flex-col gap-space-md" aria-labelledby="calcTitle">
      <h2 id="calcTitle" className="font-headline-sm text-headline-sm">
        Running cost
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <label className="flex flex-col gap-1.5 font-label-md text-label-md">
          Km per year
          <input
            id="calcKm"
            type="number"
            min="0"
            step="500"
            className="field font-code"
            value={km}
            onChange={(e) => onKmChange(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5 font-label-md text-label-md">
          Fuel price ($/L)
          <input
            id="calcPrice"
            type="number"
            min="0"
            step="0.01"
            className="field font-code"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
          />
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
        <div className="rounded-xl bg-surface-container-low p-space-md">
          <span className="eyebrow">Fuel per year</span>
          <p id="outAnnualCost" className="font-headline-md text-headline-md tabular-nums">
            {formatMoney(cost)}
          </p>
          <p className="font-code text-code text-tertiary">CAD</p>
        </div>
        <div className="rounded-xl bg-surface-container-low p-space-md">
          <span className="eyebrow">CO₂ per year</span>
          <p id="outAnnualCo2" className="font-headline-md text-headline-md tabular-nums">
            {fmt(co2T, 2)}
          </p>
          <p className="font-code text-code text-tertiary">tonnes</p>
        </div>
        <div className="rounded-xl bg-surface-container-low p-space-md">
          <span className="eyebrow">Fuel over 5 years</span>
          <p id="out5yCost" className="font-headline-md text-headline-md text-primary tabular-nums">
            {formatMoney(cost === null ? null : cost * 5)}
          </p>
          <p className="font-code text-code text-tertiary">CAD</p>
        </div>
      </div>
    </section>
  )
}
