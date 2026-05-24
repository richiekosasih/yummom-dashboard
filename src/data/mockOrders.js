const mockOrders = [
  {
    id: 'ORD-001',
    customerId: 'CUST-001',
    orderDate: '2026-05-22',
    dueDate: '2026-05-26',
    orderStatus: 'pending',
    paymentStatus: 'unpaid',
    total: 210000,
  },
  {
    id: 'ORD-002',
    customerId: 'CUST-002',
    orderDate: '2026-05-20',
    dueDate: '2026-05-23',
    orderStatus: 'completed',
    paymentStatus: 'paid',
    total: 120000,
  },
  {
    id: 'ORD-003',
    customerId: 'CUST-003',
    orderDate: '2026-05-21',
    dueDate: '2026-05-24',
    orderStatus: 'in_progress',
    paymentStatus: 'paid',
    total: 175000,
  },
]

export default mockOrders
