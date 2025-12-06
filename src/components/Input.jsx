const Input = ({ label, helper, className = '', ...props }) => {
  return (
    <label className={`flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300 ${className}`}>
      {label && <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>}
      <input
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        {...props}
      />
      {helper && <span className="text-xs text-slate-400">{helper}</span>}
    </label>
  )
}

export default Input
