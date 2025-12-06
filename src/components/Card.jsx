const Card = ({ title, description, action, children, className = '' }) => {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {(title || description || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>}
            {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export default Card
