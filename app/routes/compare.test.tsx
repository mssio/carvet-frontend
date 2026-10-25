import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Compare, { meta } from './compare'

// R2: strip React's text-node separators before asserting on text.
const out = renderToString(<Compare />).replace(/<!-- -->/g, '')

describe('Compare', () => {
  it('prerenders chrome, disabled pickers and the empty state', () => {
    for (const text of [
      'Compare cars side by side',
      'Loading cars…',
      'No cars yet — use the selector above to add your first car.',
      'value="20000"',
      'value="1.65"',
    ]) {
      expect(out).toContain(text)
    }
    expect(out).not.toContain('id="resultSection"')
    expect(out).not.toContain('NaN')
  })

  it('has the page title and description', () => {
    const m = meta({} as never)
    expect(m[0]).toEqual({ title: 'CarVet · Compare' })
    expect(m[1]).toMatchObject({ name: 'description' })
  })
})
