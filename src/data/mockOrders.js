const mockOrders = [
  {
    id: 'ORD-001',
    customerId: 'CUST-001',
    orderDate: '2026-03-28',
    dueDate: '2026-03-30',
    orderStatus: 'pending',
    paymentStatus: 'unpaid',
    total: 210000,
  },
  {
    id: 'ORD-002',
    customerId: 'CUST-002',
    orderDate: '2026-03-27',
    dueDate: '2026-03-29',
    orderStatus: 'completed',
    paymentStatus: 'paid',
    total: 120000,
  },
  {
    id: 'ORD-003',
    customerId: 'CUST-003',
    orderDate: '2026-03-26',
    dueDate: '2026-03-31',
    orderStatus: 'in_progress',
    paymentStatus: 'paid',
    total: 175000,
  },
]

export default mockOrders
