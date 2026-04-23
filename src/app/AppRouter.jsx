import { useMemo, useState, useCallback } from 'react'
import AppLayout from './AppLayout'
import { APP_ROUTES } from './routes'
import DashboardPage from '../pages/DashboardPage'
import InventoryPage from '../pages/InventoryPage'
import ProductsPage from '../pages/ProductsPage'
import OrdersPage from '../pages/OrdersPage'
import ExpensesPage from '../pages/ExpensesPage'
import NotFoundPage from '../pages/NotFoundPage'

function AppRouter() {
  const [activeRoute, setActiveRoute] = useState('dashboard')
  const [initialAction, setInitialAction] = useState(null)

  const handleNavigate = useCallback((route, action = null) => {
    setActiveRoute(route)
    setInitialAction(action)
  }, [])

  function handleSidebarRouteChange(route) {
    setActiveRoute(route)
    setInitialAction(null)
  }

  const page = useMemo(() => {
    switch (activeRoute) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />
      case 'inventory':
        return <InventoryPage initialAction={initialAction} />
      case 'products':
        return <ProductsPage initialAction={initialAction} />
      case 'orders':
        return <OrdersPage initialAction={initialAction} />
      case 'expenses':
        return <ExpensesPage />
      default:
        return <NotFoundPage />
    }
  }, [activeRoute, initialAction, handleNavigate])

  return (
    <AppLayout
      routes={APP_ROUTES}
      activeRoute={activeRoute}
      onRouteChange={handleSidebarRouteChange}
    >
      {page}
    </AppLayout>
  )
}

export default AppRouter
