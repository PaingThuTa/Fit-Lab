import { NavLink } from 'react-router-dom'

const Sidebar = ({ title = 'Navigation', links = [] }) => {
  return (
    <aside className="hidden w-64 flex-shrink-0 rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:block">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <nav className="mt-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
                isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-700/20 dark:text-white' : 'text-slate-600 dark:text-slate-300'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
