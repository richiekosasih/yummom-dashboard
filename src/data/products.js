const products = [
  {
    id: 'PRD-001',
    name: 'Pork Nuggets',
    price: 42000,
    unit: 'pack',
    status: 'active',
    totalStock: 38,
    ingredients: ['Pork', 'Bread Crumbs', 'Garlic', 'Seasoning'],
    batches: [
      {
        id: 'PN-00001',
        productionDate: '2026-03-20',
        expiryDate: '2026-05-10',
        quantity: 20,
      },
      {
        id: 'PN-00002',
        productionDate: '2026-03-27',
        expiryDate: '2026-05-17',
        quantity: 18,
      },
    ],
  },
  {
    id: 'PRD-002',
    name: 'Siomay Babi',
    price: 50000,
    unit: 'box',
    status: 'active',
    totalStock: 26,
    ingredients: ['Pork', 'Tapioca Flour', 'Garlic', 'Soy Sauce'],
    batches: [
      {
        id: 'SB-00001',
        productionDate: '2026-03-18',
        expiryDate: '2026-04-28',
        quantity: 12,
      },
      {
        id: 'SB-00002',
        productionDate: '2026-03-25',
        expiryDate: '2026-05-05',
        quantity: 14,
      },
    ],
  },
  {
    id: 'PRD-003',
    name: 'Martabak Mini',
    price: 36000,
    unit: 'box',
    status: 'active',
    totalStock: 22,
    ingredients: ['Flour', 'Egg', 'Pork Filling', 'Scallion'],
    batches: [
      {
        id: 'MM-00001',
        productionDate: '2026-03-21',
        expiryDate: '2026-04-24',
        quantity: 10,
      },
      {
        id: 'MM-00002',
        productionDate: '2026-03-29',
        expiryDate: '2026-05-02',
        quantity: 12,
      },
    ],
  },
  {
    id: 'PRD-004',
    name: 'Pork Ham',
    price: 68000,
    unit: 'pack',
    status: 'draft',
    totalStock: 12,
    ingredients: ['Pork', 'Curing Salt', 'Sugar', 'Spice Mix'],
    batches: [
      {
        id: 'PH-00001',
        productionDate: '2026-03-24',
        expiryDate: '2026-05-20',
        quantity: 12,
      },
    ],
  },
]

export default products
