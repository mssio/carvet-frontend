import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { Icon } from './Icon'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore', end: false },
  { to: '/predict', label: 'Predict', end: false },
  { to: '/compare', label: 'Compare', end: false },
]

function NavLinks() {
  return NAV.map(({ to, label, end }) => (
    <NavLink key={to} to={to} end={end} className="nav-link">
      {label}
    </NavLink>
  ))
}

export function SiteHeader() {
  const { pathname } = useLocation()
  // The menu is open only for the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div
        style={{ position: 'relative' }}
        className="max-w-7xl mx-auto px-margin-mobile md:px-margin h-16 flex items-center justify-between gap-4"
      >
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="" width={28} height={28} />
          <span className="font-headline-sm text-headline-sm">CarVet</span>
        </Link>

        <nav
          aria-label="Main"
          className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-surface-container-low"
          style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
        >
          <NavLinks />
        </nav>

        <button
          id="menuToggle"
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-surface-container"
          aria-controls="mobileNav"
          aria-expanded={open}
          aria-label="Open menu"
          onClick={() => setOpenOn(open ? null : pathname)}
        >
          <Icon name="menu" className="text-2xl" />
        </button>

        {/* Spacer to balance the desktop flex layout */}
        <div className="hidden md:block w-28"></div>
      </div>

      <nav
        id="mobileNav"
        aria-label="Main (mobile)"
        className={`${open ? '' : 'hidden '}md:hidden border-t border-slate-200 px-margin-mobile py-2 flex flex-col gap-1`}
      >
        <NavLinks />
      </nav>
    </header>
  )
}
