import { describe, expect, it } from 'vitest'
import { closedMenu, menuReducer } from './mobile-menu'

describe('menuReducer', () => {
  it('toggles open and closed', () => {
    const open = menuReducer(closedMenu('a'), { type: 'toggle' })
    expect(open.open).toBe(true)
    expect(menuReducer(open, { type: 'toggle' }).open).toBe(false)
  })

  it('closes when the location key changes', () => {
    const open = menuReducer(closedMenu('a'), { type: 'toggle' })
    expect(menuReducer(open, { type: 'location', key: 'b' }).open).toBe(false)
  })

  it('stays open when the location key is unchanged', () => {
    const open = menuReducer(closedMenu('a'), { type: 'toggle' })
    expect(menuReducer(open, { type: 'location', key: 'a' })).toBe(open)
  })

  it('does not reopen on Back to the entry where it was opened', () => {
    let s = menuReducer(closedMenu('home'), { type: 'toggle' })
    s = menuReducer(s, { type: 'location', key: 'explore' })
    s = menuReducer(s, { type: 'location', key: 'home' })
    expect(s.open).toBe(false)
  })

  it('closes on a nav click even when the location is unchanged', () => {
    const open = menuReducer(closedMenu('a'), { type: 'toggle' })
    expect(menuReducer(open, { type: 'close' }).open).toBe(false)
  })
})
