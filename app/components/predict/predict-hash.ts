import { hashParam, pickPreset } from '../../lib/carvet'
import type { Preset } from '../../lib/types'

/** Parses the Predict page's location hash (`#preset=…&km=…&price=…`). */
export function readPredictHash(
  hash: string,
  presets: Preset[],
): { preset: Preset; km: string | null; price: string | null } {
  return {
    preset: pickPreset(presets, hash),
    km: hashParam(hash, 'km'),
    price: hashParam(hash, 'price'),
  }
}
