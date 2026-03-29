import Card from '../components/ui/Card'
import { getProducts } from '../features/products/products.service'

function ProductsPage() {
  const products = getProducts()

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold">Products</h2>
        <p className="text-sm text-slate-600">
          Product list and recipe ingredients.
        </p>
      </header>

      <Card title="Product Catalog">
        <ul className="space-y-2 text-sm">
          {products.map((product) => (
            <li key={product.id}>
              <p className="font-medium">{product.name}</p>
              <p className="text-slate-500">Price: {product.price}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

export default ProductsPage
