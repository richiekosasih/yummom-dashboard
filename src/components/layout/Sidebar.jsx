function Sidebar({ routes, activeRoute, onRouteChange }) {
  return (
    <aside className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:sticky md:top-6 md:h-[calc(100vh-3rem)] md:w-64 md:flex-shrink-0">
      <h1 className="mb-1 text-2xl font-bold text-emerald-700">Yummom</h1>
      <p className="mb-6 text-xs tracking-wide text-slate-500">Frozen Food</p>

      <nav className="flex gap-1 overflow-x-auto md:block md:space-y-1">
        {routes.map((route) => {
          const isActive = route.key === activeRoute

          return (
            <button
              key={route.key}
              type="button"
              onClick={() => onRouteChange(route.key)}
              className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm font-medium transition md:w-full ${
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
