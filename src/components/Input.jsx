const Input = ({ label, helper, error, className = '', inputClassName = '', ...props }) => {
  const hasError = Boolean(error)

  return (
    <label className={`flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300 ${className}`}>
      {label && <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>}
      <input
        className={`field-control ${
          hasError
            ? 'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100 dark:border-red-800/70 dark:bg-red-950/10'
            : ''
        } ${inputClassName}`}
        {...props}
      />
      {hasError ? <span className="text-xs text-red-600 dark:text-red-400">{error}</span> : null}
      {!hasError && helper ? <span className="text-xs text-slate-400 dark:text-slate-500">{helper}</span> : null}
    </label>
  )
}

export default Input
