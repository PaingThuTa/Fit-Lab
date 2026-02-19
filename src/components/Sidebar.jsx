import { NavLink } from 'react-router-dom'

const Sidebar = ({ title = 'Navigation', links = [] }) => {
  return (
    <>
      <div className="lg:hidden">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</p>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-500/40 dark:bg-primary-500/20 dark:text-primary-200'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <aside className="panel hidden h-fit w-64 flex-shrink-0 p-5 lg:sticky lg:top-24 lg:block">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</p>
        <nav className="mt-4 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-100 dark:bg-primary-700/20 dark:text-white dark:ring-primary-700/40'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
