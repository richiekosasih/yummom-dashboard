import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { formatIDR } from '../utils/currency'
import { getProducts } from '../features/products/products.service'

function ProductsPage() {
  const products = getProducts()

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-slate-600">
            Finished frozen food products sold to customers.
          </p>
        </div>
        <Button>+ Add Product</Button>
      </header>

      <Card
        title="Finished Goods Catalog"
        subtitle="Product pricing and ingredient summary"
      >
        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="font-medium text-slate-700">No products available yet.</p>
            <p className="mt-1 text-sm text-slate-500">
              Add your first finished product to start selling.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Product Name</th>
                  <th className="py-2 pr-3">Price</th>
                  <th className="py-2 pr-3">Unit</th>
                  <th className="py-2">Ingredient Summary</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-slate-100">
                    <td className="py-3 pr-3 font-medium text-slate-700">{product.name}</td>
                    <td className="py-3 pr-3 text-slate-700">{formatIDR(product.price)}</td>
                    <td className="py-3 pr-3 text-slate-600">{product.unit}</td>
                    <td className="py-3 text-slate-600">{product.ingredientSummary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default ProductsPage
