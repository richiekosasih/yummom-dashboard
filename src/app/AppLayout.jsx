import Sidebar from '../components/layout/Sidebar'

function AppLayout({ routes, activeRoute, onRouteChange, children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:flex-row md:p-6">
        <Sidebar
          routes={routes}
          activeRoute={activeRoute}
          onRouteChange={onRouteChange}
        />
        <main className="min-h-[calc(100vh-2rem)] min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
