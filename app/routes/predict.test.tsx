import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Predict, { meta } from './predict'

// R2: strip React's text-node separators before asserting on text.
const out = renderToString(<Predict />).replace(/<!-- -->/g, '')

describe('Predict', () => {
  it('prerenders the default RAV4 preset without reading the hash', () => {
    for (const text of ['2024 Toyota RAV4 AWD', 'Estimate, not an official NRCan rating.', '$2,805', 'aria-pressed="true"']) {
      expect(out).toContain(text)
    }
    expect(out).not.toContain('NaN')
  })

  it('has the page title and description', () => {
    const m = meta({} as never)
    expect(m[0]).toEqual({ title: 'CarVet · Predict' })
    expect(m[1]).toMatchObject({ name: 'description' })
  })
})
