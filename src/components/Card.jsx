const Card = ({ title, description, action, children, className = '' }) => {
  return (
    <div className={`panel fade-in-up ${className}`}>
      {(title || description || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>}
            {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          {action ? <div className="pt-0.5">{action}</div> : null}
        </div>
      )}
      {children}
    </div>
  )
}

export default Card
