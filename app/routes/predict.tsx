import { useEffect, useState } from 'react'
import { PresetButtons } from '../components/PresetButtons'
import { readPredictHash } from '../components/predict/predict-hash'
import { ERROR_MESSAGE, ResultsPanel, type ResultState } from '../components/predict/ResultsPanel'
import { RunningCost } from '../components/predict/RunningCost'
import { VehicleForm, type FormValues } from '../components/predict/VehicleForm'
import { vehicleName } from '../lib/carvet'
import { predict, stats } from '../lib/data'
import { createLatestGuard } from '../lib/latest-guard'
import type { Prediction, Preset, VehicleRecord, VehicleSpec } from '../lib/types'
import type { Route } from './+types/predict'

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'CarVet · Predict' },
    {
      name: 'description',
      content:
        'CarVet — predicting vehicle CO₂ emissions and fuel consumption from specifications, by Team Moneyball.',
    },
  ]
}

const presets = stats.presets.predict

function toFormValues(r: VehicleRecord): FormValues {
  return { year: r.year, make: r.make, cls: r.cls, engine: r.engine.toFixed(1), cyl: r.cyl, trans: r.trans, fuel: r.fuel }
}

function presetPrediction(p: Preset): Prediction {
  const r = p.record
  return { co2: r.co2, comb: r.comb, city: r.city, hwy: r.hwy, label: vehicleName(r), source: 'preset' }
}

export default function Predict() {
  // Initial state must not depend on the URL hash: the prerendered HTML has none.
  const [values, setValues] = useState<FormValues>(() => toFormValues(presets[0].record))
  const [activeId, setActiveId] = useState<string | null>(presets[0].id)
  const [km, setKm] = useState('20000')
  const [price, setPrice] = useState('1.65')
  const [state, setState] = useState<ResultState>(() => ({ kind: 'result', prediction: presetPrediction(presets[0]) }))
  const [previous, setPrevious] = useState<Prediction | null>(() => presetPrediction(presets[0]))
  const [guard] = useState(createLatestGuard)

  function showPreset(p: Preset) {
    guard.next() // invalidate any pending prediction
    const prediction = presetPrediction(p)
    setValues(toFormValues(p.record))
    setActiveId(p.id)
    setState({ kind: 'result', prediction })
    setPrevious(prediction)
  }

  // Apply the URL hash only after mount, so hydration matches the prerendered HTML.
  // The hash is external state the prerender cannot know, so setState here is intentional.
  useEffect(() => {
    const { preset, km: kmHash, price: priceHash } = readPredictHash(location.hash, presets)
    // oxlint-disable-next-line react/set-state-in-effect
    showPreset(preset)
    if (kmHash !== null) setKm(kmHash)
    if (priceHash !== null) setPrice(priceHash)
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function edit(patch: Partial<FormValues>) {
    setValues((v) => ({ ...v, ...patch }))
    setActiveId(null)
  }

  async function submit() {
    const id = guard.next()
    const spec: VehicleSpec = { ...values, engine: Number(values.engine), fuel: values.fuel as VehicleSpec['fuel'] }
    setState({ kind: 'pending' })
    let next: ResultState
    try {
      const prediction = Number.isFinite(spec.engine) && values.engine.trim() !== '' ? await predict(spec) : null
      next = prediction ? { kind: 'result', prediction } : { kind: 'empty' }
    } catch {
      next = { kind: 'error', message: ERROR_MESSAGE }
    }
    if (!guard.isLatest(id)) return
    setState(next)
    if (next.kind === 'result') setPrevious(next.prediction)
    document.getElementById('resultsPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* [Hero] */}
      <section className="flex flex-col gap-space-md">
        <div className="max-w-2xl flex flex-col gap-2">
          <h1 className="text-headline-xl-mobile md:font-headline-xl md:text-headline-xl">Predict CO₂ and fuel use.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Enter a vehicle's specs. Get emissions, fuel use and running cost.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-label-md text-label-md text-tertiary">Try an example</p>
          <div id="presetList" className="flex flex-wrap gap-2">
            <PresetButtons
              presets={presets}
              activeId={activeId}
              onPick={(id) => showPreset(presets.find((p) => p.id === id) ?? presets[0])}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <VehicleForm values={values} pending={state.kind === 'pending'} onChange={edit} onSubmit={submit} />
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          <ResultsPanel state={state} previous={previous} />
          <RunningCost
            prediction={state.kind === 'result' ? state.prediction : null}
            km={km}
            price={price}
            onKmChange={setKm}
            onPriceChange={setPrice}
          />
        </div>
      </div>

      {/* [About these estimates] */}
      <details className="card">
        <summary className="cursor-pointer font-title text-title">About these estimates</summary>
        <div className="flex flex-col gap-2 mt-3 font-body-sm text-body-sm text-on-surface-variant">
          <p>
            A regression model trained on 29,215 NRCan lab-tested vehicles (1995–2026, gas, diesel and hybrid) predicts
            CO₂ and fuel use from seven specs.
          </p>
          <p>
            Results are estimates, not official ratings for any specific vehicle. CarVet uses public data and collects
            no personal information.
          </p>
        </div>
      </details>
    </>
  )
}
