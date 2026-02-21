const variantClasses = {
  primary:
    'bg-primary-600 text-white shadow-sm shadow-primary-900/20 hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500 disabled:bg-primary-400',
  secondary:
    'bg-secondary text-white shadow-sm shadow-teal-900/20 hover:bg-teal-500 active:bg-teal-600 focus-visible:ring-secondary disabled:bg-teal-300',
  outline:
    'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-800',
  ghost:
    'text-slate-600 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700',
}

const sizeClasses = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
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
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900 ${variantStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

export default Button
