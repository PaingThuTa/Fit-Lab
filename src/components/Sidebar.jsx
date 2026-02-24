import { NavLink } from 'react-router-dom'

/* ── nav icons ── */
const NavIcon = ({ name }) => {
  const cls = 'h-[18px] w-[18px] shrink-0'
  switch (name) {
    case 'home':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}>
          <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
        </svg>
      )
    case 'compass':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}>
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
        </svg>
      )
    case 'bookmark':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}>
          <path d="M6.3 2.84A1.5 1.5 0 0 1 7.5 2.25h5a1.5 1.5 0 0 1 1.5 1.5v11.25a.75.75 0 0 1-1.136.643L10 14.305l-2.864 1.338A.75.75 0 0 1 6 15V3.75a1.5 1.5 0 0 1 .3-.91Z" />
        </svg>
      )
    case 'chat':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}>
          <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM8 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
        </svg>
      )
    case 'chart':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}>
          <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9a1.5 1.5 0 0 0 3 0v-9A1.5 1.5 0 0 0 9.5 6ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5a1.5 1.5 0 0 0 3 0v-5A1.5 1.5 0 0 0 3.5 10Z" />
        </svg>
      )
    case 'book':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}>
          <path d="M10.75 16.82A7.462 7.462 0 0 1 10 17c-.34 0-.673-.023-1-.068V4.385l.96-.9.96.9v12.435ZM8 3.5a.75.75 0 0 0-.75.75v12.378a6.016 6.016 0 0 1-2.483-1.376A1.5 1.5 0 0 1 4.26 14.1V5.02a1.5 1.5 0 0 1 .492-1.127A6.966 6.966 0 0 1 8 2.755V3.5ZM12 2.755a6.966 6.966 0 0 1 3.248 1.138A1.5 1.5 0 0 1 15.74 5.02v9.08a1.5 1.5 0 0 1-.507 1.152A6.016 6.016 0 0 1 12.75 16.628V3.5a.75.75 0 0 0-.75-.745Z" />
        </svg>
      )
    case 'plus':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}>
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
        </svg>
      )
    case 'users':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}>
          <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
        </svg>
      )
    case 'badge':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}>
          <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
        </svg>
      )
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}>
          <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 0 1 4.25 2h11.5A2.25 2.25 0 0 1 18 4.25v8.5A2.25 2.25 0 0 1 15.75 15h-3.105a3.501 3.501 0 0 0 1.1 1.677A.75.75 0 0 1 13.26 18H6.74a.75.75 0 0 1-.484-1.323A3.501 3.501 0 0 0 7.355 15H4.25A2.25 2.25 0 0 1 2 12.75v-8.5Z" clipRule="evenodd" />
        </svg>
      )
  }
}

const Sidebar = ({ title = 'Navigation', links = [], mobileOpen = false, onMobileClose }) => {
  const linkClasses = ({ isActive }) =>
    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
      isActive
        ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
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
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-primary-500 dark:bg-primary-400" />
              )}
              <span className={isActive ? 'text-primary-600 dark:text-primary-300' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}>
                <NavIcon name={link.icon} />
              </span>
              <span className={isActive ? 'font-semibold' : ''}>{link.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <>
      {/* ── mobile overlay drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" onClick={onMobileClose}>
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
        </div>
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-200/75
          bg-white transition-transform duration-200 ease-out
          dark:border-slate-800/90 dark:bg-slate-950
          lg:static lg:translate-x-0 lg:transition-none
          ${mobileOpen ? 'translate-x-0 shadow-xl shadow-slate-900/10 dark:shadow-slate-950/40' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* ── brand mark ── */}
          <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-slate-100 px-5 dark:border-slate-800/70">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-[13px] font-bold text-white shadow-sm shadow-primary-600/30">
              F
            </div>
            <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
              Fit<span className="text-primary-600">Lab</span>
            </span>
          </div>

          <div className="flex flex-col gap-0 px-3 pb-6 pt-5">
            {/* section label */}
            <p className="mb-3 px-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              {title}
            </p>

            {navContent}
          </div>

          <div className="mt-auto" />
        </div>
      </aside>
    </>
  )
}

export default Sidebar
