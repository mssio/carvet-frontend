import { useReducer } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { Icon } from './Icon'
import { closedMenu, menuReducer } from './mobile-menu'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore', end: false },
  { to: '/predict', label: 'Predict', end: false },
  { to: '/compare', label: 'Compare', end: false },
]

function NavLinks({ onNavigate }: { onNavigate: () => void }) {
  return NAV.map(({ to, label, end }) => (
    <NavLink key={to} to={to} end={end} className="nav-link" onClick={onNavigate}>
      {label}
    </NavLink>
  ))
}

export function SiteHeader() {
  const { key, pathname } = useLocation()
  // Static hosts may serve prerendered pages with a trailing slash.
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  const centred = path === '/'
  const [menu, dispatch] = useReducer(menuReducer, key, closedMenu)
  // Any navigation (including Back to the page it was opened on) closes the menu.
  if (menu.locationKey !== key) dispatch({ type: 'location', key })
  const open = menu.open && menu.locationKey === key
  const close = () => dispatch({ type: 'close' })

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div
        style={centred ? { position: 'relative' } : undefined}
        className="max-w-7xl mx-auto px-margin-mobile md:px-margin h-16 flex items-center justify-between gap-4"
      >
        <Link to="/" className="flex items-center gap-2" onClick={close}>
          <img src="/logo.svg" alt="" width={28} height={28} />
          <span className="font-headline-sm text-headline-sm">CarVet</span>
        </Link>

        <nav
          aria-label="Main"
          className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-surface-container-low"
          style={centred ? { position: 'absolute', left: '50%', transform: 'translateX(-50%)' } : undefined}
        >
          <NavLinks onNavigate={close} />
        </nav>

        <button
          id="menuToggle"
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-surface-container"
          aria-controls="mobileNav"
          aria-expanded={open}
          aria-label="Open menu"
          onClick={() => dispatch({ type: 'toggle' })}
        >
          <Icon name="menu" className="text-2xl" />
        </button>

        {/* Spacer to balance the desktop flex layout */}
        {centred && <div className="hidden md:block w-28"></div>}
      </div>

      <nav
        id="mobileNav"
        aria-label="Main (mobile)"
        className={`${open ? '' : 'hidden '}md:hidden border-t border-slate-200 px-margin-mobile py-2 flex flex-col gap-1`}
      >
        <NavLinks onNavigate={close} />
      </nav>
      {path === '/compare' && (
        <div className="bg-surface-container-low border-t border-slate-200">
          <p className="max-w-7xl mx-auto px-margin-mobile md:px-margin py-1.5 font-label-sm text-label-sm text-tertiary flex items-center gap-1.5">
            <Icon name="database" /> Data source: Natural Resources Canada Fuel Consumption Ratings — Open Government Licence – Canada
          </p>
        </div>
      )}
    </header>
  )
}
