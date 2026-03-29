function Button({ type = 'button', variant = 'primary', children, ...props }) {
  const variantClass =
    variant === 'secondary'
      ? 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50'
      : 'bg-blue-600 text-white hover:bg-blue-700'

  return (
    <button
      type={type}
      className={`rounded-md px-4 py-2 text-sm font-medium transition ${variantClass}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
