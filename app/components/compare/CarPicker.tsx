import { Icon } from '../Icon'

export interface PickerOption {
  value: string
  label: string
}

const BLANK: PickerOption = { value: '', label: '—' }

function Select({
  id,
  label,
  options,
  value,
  disabled,
  onChange,
}: {
  id: string
  label: string
  options: PickerOption[]
  value: string
  disabled: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className="flex flex-col gap-1 font-label-md text-label-md">
      {label}
      <select id={id} className="field" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export interface PickerState {
  year: string
  make: string
  model: string
  variant: string
}

export function CarPicker({
  status,
  value,
  years,
  makes,
  models,
  variants,
  addDisabled,
  addNote,
  km,
  price,
  onYear,
  onMake,
  onModel,
  onVariant,
  onAdd,
  onKm,
  onPrice,
}: {
  status: 'loading' | 'ready' | 'error'
  value: PickerState
  years: PickerOption[]
  makes: PickerOption[]
  models: PickerOption[]
  variants: PickerOption[]
  addDisabled: boolean
  addNote: string | null
  km: string
  price: string
  onYear: (v: string) => void
  onMake: (v: string) => void
  onModel: (v: string) => void
  onVariant: (v: string) => void
  onAdd: () => void
  onKm: (v: string) => void
  onPrice: (v: string) => void
}) {
  const loading: PickerOption[] = [{ value: '', label: 'Loading cars…' }]
  const locked = status !== 'ready'
  const opts = (list: PickerOption[]) => (status === 'loading' ? loading : [BLANK, ...list])
  return (
    <section className="card flex flex-col gap-space-md">
      <h2 className="font-headline-sm text-headline-sm flex items-center gap-2">
        <Icon name="car" className="text-primary" /> Add a car
      </h2>
      {status === 'error' && (
        <p className="font-body-sm text-body-sm text-tertiary" role="alert">
          Couldn’t load the car list. Please reload the page.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Select id="pYear" label="Year" options={opts(years)} value={value.year} disabled={locked} onChange={onYear} />
        <Select id="pMake" label="Make" options={opts(makes)} value={value.make} disabled={locked} onChange={onMake} />
        <Select id="pModel" label="Model" options={opts(models)} value={value.model} disabled={locked} onChange={onModel} />
        <Select
          id="pVariant"
          label="Version"
          options={status === 'loading' ? loading : variants.length ? variants : [BLANK]}
          value={value.variant}
          disabled={locked}
          onChange={onVariant}
        />
      </div>
      <button
        id="addBtn"
        type="button"
        className="btn-primary w-full"
        disabled={addDisabled}
        style={addDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
        onClick={onAdd}
      >
        <Icon name="git-compare" /> Add this car
      </button>
      {addNote && (
        <p id="maxNote" className="font-body-sm text-body-sm text-tertiary">
          {addNote}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100">
        <label className="flex flex-col gap-1 font-label-md text-label-md">
          Annual distance (km)
          <input
            id="cmpKm"
            type="number"
            min="0"
            step="500"
            className="field font-code"
            value={km}
            onChange={(e) => onKm(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 font-label-md text-label-md">
          Fuel price (CAD / litre)
          <input
            id="cmpPrice"
            type="number"
            min="0"
            step="0.01"
            className="field font-code"
            value={price}
            onChange={(e) => onPrice(e.target.value)}
          />
        </label>
      </div>
    </section>
  )
}

