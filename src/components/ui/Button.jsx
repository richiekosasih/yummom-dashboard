function Button({
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const variantClass =
    variant === 'secondary'
      ? 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
      : variant === 'soft'
        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
      : 'bg-emerald-600 text-white shadow hover:bg-emerald-700'

  const sizeClass = size === 'lg' ? 'px-5 py-2.5 text-sm' : 'px-4 py-2 text-sm'

  return (
    <button
      type={type}
      className={`rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
