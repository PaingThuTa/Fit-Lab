const variantClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-secondary text-white hover:bg-teal-500 focus:ring-secondary',
  outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:text-slate-100 dark:border-slate-600',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
}

const sizeClasses = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-6 py-3',
}

const Button = ({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...props
}) => {
  const variantStyle = variantClasses[variant] ?? variantClasses.primary
  const sizeStyle = sizeClasses[size] ?? sizeClasses.md
  const isButtonElement = Component === 'button'

  return (
    <Component
      type={isButtonElement ? type : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${variantStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

export default Button
