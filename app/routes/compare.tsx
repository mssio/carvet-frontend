import { useEffect, useState } from 'react'
import { CarCards } from '../components/compare/CarCards'
import { CarPicker, type PickerOption } from '../components/compare/CarPicker'
import { CompareResults } from '../components/compare/CompareResults'
import { Icon } from '../components/Icon'
import { toNumber } from '../lib/carvet'
import { compareAddState } from '../lib/compare-state'
import { loadCars } from '../lib/data'
import type { VehicleRecord } from '../lib/types'
import { fuelLabel, transLabel } from '../lib/vehicle-labels'
import type { Route } from './+types/compare'

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'CarVet · Compare' },
    {
      name: 'description',
      content:
        'CarVet — predicting vehicle CO₂ emissions and fuel consumption from specifications, by Team Moneyball.',
    },
  ]
}

// year -> make -> model -> [all variant records]
type Index = Map<number, Map<string, Map<string, VehicleRecord[]>>>

function buildIndex(cars: VehicleRecord[]): Index {
  const byYear: Index = new Map()
  for (const r of cars) {
    const makes = byYear.get(r.year) ?? new Map()
    const models = makes.get(r.make) ?? new Map()
    const variants = models.get(r.model) ?? []
    variants.push(r)
    models.set(r.model, variants)
    makes.set(r.make, models)
    byYear.set(r.year, makes)
  }
  return byYear
}

const toOptions = (values: (string | number)[]): PickerOption[] =>
  values.map((v) => ({ value: String(v), label: String(v) }))

const EMPTY_PICK = { year: '', make: '', model: '', variant: '' }

export default function Compare() {
  const [index, setIndex] = useState<Index | null>(null)
  const [failed, setFailed] = useState(false)
  const [pick, setPick] = useState(EMPTY_PICK)
  const [selected, setSelected] = useState<VehicleRecord[]>([])
  const [km, setKm] = useState('20000')
  const [price, setPrice] = useState('1.65')

  useEffect(() => {
    let cancelled = false
    loadCars().then(
      (cars) => {
        if (!cancelled) setIndex(buildIndex(cars))
      },
      (err) => {
        console.error('Failed to load cars', err)
        if (!cancelled) setFailed(true)
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  const years = index ? [...index.keys()].sort((a, b) => b - a) : []
  const makesMap = pick.year ? index?.get(Number(pick.year)) : undefined
  const modelsMap = pick.make ? makesMap?.get(pick.make) : undefined
  const variantRecs = (pick.model && modelsMap?.get(pick.model)) || []
  const current = pick.variant === '' ? null : (variantRecs[Number(pick.variant)] ?? null)
  const addState = compareAddState(selected, current)

  const variants: PickerOption[] = variantRecs.map((r, i) => ({
    value: String(i),
    label: `${r.engine.toFixed(1)}L · ${transLabel(r.trans)} · ${fuelLabel(r.fuel)}`,
  }))

  function add() {
    if (!current || addState.disabled) return
    setSelected([...selected, current])
    setPick(EMPTY_PICK) // reset to blank, ready for the next car
  }

  const kmNum = toNumber(km)
  const priceNum = toNumber(price)

  return (
    <>
      <section className="flex flex-col gap-2">
        <span className="chip bg-secondary-container text-on-secondary-container w-fit font-code uppercase">Compare</span>
        <h1 className="text-display-mobile md:font-display md:text-display">Compare cars side by side</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Add 2 to 4 cars below and see which one is greener and cheaper to run.
        </p>
        <span className="estimate-note">
          <Icon name="shield-check" /> Based on official NRCan data
        </span>
      </section>

      <CarPicker
        status={failed ? 'error' : index ? 'ready' : 'loading'}
        value={pick}
        years={toOptions(years)}
        makes={toOptions(makesMap ? [...makesMap.keys()].sort() : [])}
        models={toOptions(modelsMap ? [...modelsMap.keys()].sort() : [])}
        variants={variants}
        addDisabled={addState.disabled}
        addNote={addState.note}
        km={km}
        price={price}
        onYear={(year) => setPick({ ...EMPTY_PICK, year })}
        onMake={(make) => setPick({ ...EMPTY_PICK, year: pick.year, make })}
        onModel={(model) => {
          const recs = (model && modelsMap?.get(model)) || []
          setPick({ ...pick, model, variant: recs.length ? '0' : '' })
        }}
        onVariant={(variant) => setPick({ ...pick, variant })}
        onAdd={add}
        onKm={setKm}
        onPrice={setPrice}
      />

      <section id="cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <CarCards
          selected={selected}
          km={kmNum}
          price={priceNum}
          onRemove={(i) => setSelected(selected.filter((_, j) => j !== i))}
        />
      </section>

      {selected.length > 0 && <CompareResults selected={selected} km={kmNum} price={priceNum} />}

      <section className="rounded-xl bg-surface-container-low p-space-lg flex gap-3 font-body-sm text-body-sm text-on-surface-variant">
        <Icon name="info" className="text-xl text-primary" />
        <p>
          Figures come from Natural Resources Canada fuel-consumption data and are for comparison only; real-world results vary
          with driving style, load, weather and maintenance.
        </p>
      </section>
    </>
  )
}
