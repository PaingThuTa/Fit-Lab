import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from './Button'
import { useAuthStore } from '../store/useAuthStore'

/* ── helpers ── */
const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

const roleMeta = {
  admin: { label: 'Admin', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  trainer: { label: 'Trainer', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  member: { label: 'Member', color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' },
}

const sectionTitles = {
  admin: 'Admin Panel',
  trainer: 'Trainer Studio',
  member: 'Member Area',
}

/* ── icons (inline SVG) ── */
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
    <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.061l1.061-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.061l1.061-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.061 1.06l1.06 1.061ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.061 1.06l1.06 1.061Z" />
  </svg>
)
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
    <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clipRule="evenodd" />
  </svg>
)
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
    <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
)
const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
    <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />
    <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
  </svg>
)
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
    <path fillRule="evenodd" d="M2 4.75A2.75 2.75 0 0 1 4.75 2h3a.75.75 0 0 1 0 1.5h-3c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h3a.75.75 0 0 1 0 1.5h-3A2.75 2.75 0 0 1 2 11.25v-6.5Zm9.47.47a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H6.5a.75.75 0 0 1 0-1.5h5.94l-.97-.97a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
)
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
    <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
  </svg>
)
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
  </svg>
)

/* ── component ── */
const Navbar = ({ onMobileMenuToggle, mobileMenuOpen }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)
  const theme = useAuthStore((state) => state.theme)
  const logout = useAuthStore((state) => state.logout)
  const setTheme = useAuthStore((state) => state.setTheme)
  const updateUserName = useAuthStore((state) => state.updateUserName)

  const [menuOpen, setMenuOpen] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState(user?.name || '')
  const menuRef = useRef(null)

  /* close dropdown on outside click */
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
        setEditingName(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSaveName = () => {
    const trimmed = draftName.trim()
    if (trimmed.length === 0) return
    updateUserName(trimmed)
    setEditingName(false)
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const badge = roleMeta[role] || roleMeta.member

  /* derive section title from current path */
  const activeSection = location.pathname.split('/')[1] || ''
  const pageTitle = sectionTitles[activeSection] || ''

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/80">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        {/* ── left: hamburger + section context ── */}
        <div className="flex items-center gap-3 min-w-0">
          {/* mobile hamburger — only when sidebar is relevant */}
          {onMobileMenuToggle && (
            <button
              type="button"
              onClick={onMobileMenuToggle}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          )}

          {user && role && pageTitle ? (
            <div className="flex items-center gap-2.5">
              <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.color}`}>
                {badge.label}
              </span>
              <span className="hidden text-sm font-semibold text-slate-700 dark:text-slate-200 sm:block truncate">
                {pageTitle}
              </span>
            </div>
          ) : !user ? null : (
            <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
              Welcome back
            </span>
          )}
        </div>

        {/* ── right section ── */}
        <div className="flex items-center gap-1">
          {/* theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {user ? (
            /* ── user dropdown ── */
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/70"
              >
                {/* avatar */}
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary-400 to-primary-600 text-[11px] font-bold text-white shadow-sm">
                  {getInitials(user.name)}
                </div>
                {/* name (hidden on small screens) */}
                <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:block max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDownIcon />
              </button>

              {/* dropdown panel */}
              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right animate-[fadeInUp_0.15s_ease-out] rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-lg shadow-slate-900/10 dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-slate-950/40">
                  {/* user info header */}
                  <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white">
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {user.name}
                      </p>
                      <span
                        className={`mt-0.5 inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />

                  {/* edit name */}
                  {editingName ? (
                    <div className="space-y-2 px-3 py-2">
                      <input
                        className="field-control w-full px-3 py-1.5 text-sm"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        placeholder="Enter your name"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName()
                          if (e.key === 'Escape') setEditingName(false)
                        }}
                      />
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2.5 text-xs"
                          onClick={() => setEditingName(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 px-2.5 text-xs"
                          onClick={handleSaveName}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setDraftName(user.name)
                        setEditingName(true)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/70"
                    >
                      <PencilIcon />
                      Edit name
                    </button>
                  )}

                  <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />

                  {/* logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    <LogoutIcon />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── guest buttons ── */
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Join free
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
