import { describe, expect, it } from 'vitest'
import { stats } from '../../lib/data'
import { readPredictHash } from './predict-hash'

const presets = stats.presets.predict
const byId = (id: string) => presets.find((p) => p.id === id)

describe('readPredictHash', () => {
  it('defaults to the first preset with no km or price', () => {
    expect(readPredictHash('', presets)).toEqual({ preset: byId('rav4'), km: null, price: null })
  })

  it('reads preset, km and price from the hash', () => {
    expect(readPredictHash('#preset=f150&km=15000&price=1.80', presets)).toEqual({
      preset: byId('f150'),
      km: '15000',
      price: '1.80',
    })
  })

  it('falls back to the first preset for an unknown id', () => {
    expect(readPredictHash('#preset=bogus', presets).preset.id).toBe('rav4')
  })
})
