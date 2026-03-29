function Button({ type = 'button', variant = 'primary', children, ...props }) {
  const variantClass =
    variant === 'secondary'
      ? 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
      : 'bg-emerald-600 text-white shadow hover:bg-emerald-700'

  return (
    <button
      type={type}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${variantClass}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
