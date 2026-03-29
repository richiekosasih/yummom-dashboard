function Sidebar({ routes, activeRoute, onRouteChange }) {
  return (
    <aside className="sticky top-4 h-[calc(100vh-2rem)] w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h1 className="mb-1 text-2xl font-bold text-emerald-700">Yummom</h1>
      <p className="mb-6 text-xs tracking-wide text-slate-500">FROZEN LOGISTICS</p>

      <nav className="space-y-1">
        {routes.map((route) => {
          const isActive = route.key === activeRoute

          return (
            <button
              key={route.key}
              type="button"
              onClick={() => onRouteChange(route.key)}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                isActive
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {route.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
