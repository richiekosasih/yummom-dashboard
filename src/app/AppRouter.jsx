import { useMemo, useState } from 'react'
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

  const page = useMemo(() => {
    switch (activeRoute) {
      case 'dashboard':
        return <DashboardPage />
      case 'inventory':
        return <InventoryPage />
      case 'products':
        return <ProductsPage />
      case 'orders':
        return <OrdersPage />
      case 'expenses':
        return <ExpensesPage />
      default:
        return <NotFoundPage />
    }
  }, [activeRoute])

  return (
    <AppLayout
      routes={APP_ROUTES}
      activeRoute={activeRoute}
      onRouteChange={setActiveRoute}
    >
      {page}
    </AppLayout>
  )
}

export default AppRouter
