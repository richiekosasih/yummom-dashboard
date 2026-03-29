function Sidebar({ routes, activeRoute, onRouteChange }) {
  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-slate-200 bg-white p-4">
      <h1 className="mb-1 text-xl font-bold text-slate-900">Yummom</h1>
      <p className="mb-6 text-sm text-slate-500">Dashboard MVP</p>

      <nav className="space-y-1">
        {routes.map((route) => {
          const isActive = route.key === activeRoute

          return (
            <button
              key={route.key}
              type="button"
              onClick={() => onRouteChange(route.key)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
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
