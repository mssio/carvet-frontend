import type { FormEvent } from 'react'
import { stats } from '../../lib/data'

export interface FormValues {
  year: number
  make: string
  cls: string
  engine: string
  cyl: number
  trans: string
  fuel: string
}

const D = stats.domains
const yearsDescending = D.years.slice().reverse()

export function VehicleForm({
  values,
  pending,
  onChange,
  onSubmit,
}: {
  values: FormValues
  pending: boolean
  onChange: (patch: Partial<FormValues>) => void
  onSubmit: () => void
}) {
  function submit(e: FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <section className="lg:col-span-5 card flex flex-col gap-space-md" aria-labelledby="formTitle">
      <h2 id="formTitle" className="font-headline-sm text-headline-sm">
        Your vehicle
      </h2>
      <form id="predictForm" className="flex flex-col gap-4" noValidate onSubmit={submit}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fYear" className="font-label-md text-label-md">
            Model year
          </label>
          <div className="flex items-center gap-3">
            <input
              id="fYearRange"
              type="range"
              min="1995"
              max="2026"
              className="w-full accent-primary"
              aria-label="Model year slider"
              value={values.year}
              onChange={(e) => onChange({ year: Number(e.target.value) })}
            />
            <select
              id="fYear"
              className="field w-28 font-code"
              value={values.year}
              onChange={(e) => onChange({ year: Number(e.target.value) })}
            >
              {yearsDescending.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fMake" className="font-label-md text-label-md">
            Make
          </label>
          <select id="fMake" className="field" value={values.make} onChange={(e) => onChange({ make: e.target.value })}>
            {D.makes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fClass" className="font-label-md text-label-md">
            Vehicle class
          </label>
          <select id="fClass" className="field" value={values.cls} onChange={(e) => onChange({ cls: e.target.value })}>
            {D.classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fEngine" className="font-label-md text-label-md">
              Engine size
            </label>
            <div className="relative">
              <input
                id="fEngine"
                type="number"
                min="0.8"
                max="8.4"
                step="0.1"
                className="field pr-10 font-code"
                value={values.engine}
                onChange={(e) => onChange({ engine: e.target.value })}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 rounded bg-slate-100 text-slate-500 font-code text-code">
                L
              </span>
            </div>
          </div>
          <fieldset className="flex flex-col gap-1.5">
            <legend className="font-label-md text-label-md mb-1.5">Cylinders</legend>
            <div id="fCyl" className="flex flex-wrap gap-1">
              {D.cylinders.map((c) => (
                <label key={c} className="cursor-pointer">
                  <input
                    type="radio"
                    name="cyl"
                    value={c}
                    className="peer sr-only"
                    checked={values.cyl === c}
                    onChange={() => onChange({ cyl: c })}
                  />
                  <span className="inline-flex w-10 h-10 items-center justify-center rounded-lg border border-slate-200 font-code text-code peer-checked:bg-primary-container peer-checked:text-on-primary peer-focus-visible:ring-2 peer-focus-visible:ring-secondary">
                    {c}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fTrans" className="font-label-md text-label-md">
            Transmission
          </label>
          <select
            id="fTrans"
            className="field"
            value={values.trans}
            onChange={(e) => onChange({ trans: e.target.value })}
          >
            {D.transmissions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fFuel" className="font-label-md text-label-md">
            Fuel type
          </label>
          <select id="fFuel" className="field" value={values.fuel} onChange={(e) => onChange({ fuel: e.target.value })}>
            {D.fuels.map((f) => (
              <option key={f.code} value={f.code}>
                {`${f.code} — ${f.label}`}
              </option>
            ))}
          </select>
        </div>
        <button id="runBtn" type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? 'Estimating…' : 'Predict'}
        </button>
      </form>
    </section>
  )
}
