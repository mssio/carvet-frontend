export type MenuState = { open: boolean; locationKey: string }
export type MenuAction = { type: 'toggle' } | { type: 'close' } | { type: 'location'; key: string }

export const closedMenu = (locationKey: string): MenuState => ({ open: false, locationKey })

// Open state is stored with the location it was seen on; any location change closes it.
export function menuReducer(state: MenuState, action: MenuAction): MenuState {
  switch (action.type) {
    case 'toggle':
      return { ...state, open: !state.open }
    case 'close':
      return state.open ? { ...state, open: false } : state
    case 'location':
      return action.key === state.locationKey ? state : closedMenu(action.key)
  }
}
