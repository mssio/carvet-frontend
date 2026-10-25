import { co2Band } from '../lib/carvet'

export function Co2BandChip({ gkm }: { gkm: number }) {
  const { key, label } = co2Band(gkm)
  return <span className={`chip chip-${key}`}>{label}</span>
}
