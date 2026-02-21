import { NavLink } from 'react-router-dom'

const Sidebar = ({ title = 'Navigation', links = [], mobileOpen = false, onMobileClose }) => {
  const linkClasses = ({ isActive }) =>
    `group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
      isActive
        ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-500/5 dark:bg-primary-500/15 dark:text-primary-200'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
    }`

  const navContent = (
    <nav className="space-y-0.5">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={linkClasses}
          onClick={onMobileClose}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <>
      {/* ── mobile overlay drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" onClick={onMobileClose}>
          {/* backdrop */}
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
        </div>
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-200/75
          bg-slate-50/98 transition-transform duration-200 ease-out
          dark:border-slate-800/90 dark:bg-slate-950/95
          lg:static lg:translate-x-0 lg:transition-none
          ${mobileOpen ? 'translate-x-0 shadow-xl shadow-slate-900/10 dark:shadow-slate-950/40' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col overflow-y-auto px-4 pb-6 pt-20 lg:pt-6">
          {/* section label */}
          <div className="mb-4 flex items-center gap-2 px-3">
            <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
              {title}
            </p>
          </div>

          {navContent}

          {/* bottom spacer for scroll */}
          <div className="mt-auto" />
        </div>
      </aside>
    </>
  )
}

export default Sidebar
