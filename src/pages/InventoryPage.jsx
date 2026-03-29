import Card from '../components/ui/Card'
import { getInventoryItems } from '../features/inventory/inventory.service'

function InventoryPage() {
  const items = getInventoryItems()

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold">Inventory</h2>
        <p className="text-sm text-slate-600">
          Track ingredient stock and availability.
        </p>
      </header>

      <Card title="Current Items">
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between">
              <span>{item.name}</span>
              <span className="text-slate-500">
                {item.stock} {item.unit}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

export default InventoryPage
