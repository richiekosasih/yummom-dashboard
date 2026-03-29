import Sidebar from '../components/layout/Sidebar'

function AppLayout({ routes, activeRoute, onRouteChange, children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-7xl">
        <Sidebar
          routes={routes}
          activeRoute={activeRoute}
          onRouteChange={onRouteChange}
        />
        <main className="min-h-screen flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}

export default AppLayout
