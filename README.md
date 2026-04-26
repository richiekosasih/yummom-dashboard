# Yummom Dashboard

A React-based business management dashboard for a small frozen food business. It helps manage products, inventory, orders, expenses, and daily business summaries — all in one place.

Built as an MVP with local-only data persistence. No backend required.

## Features

- **Dashboard** — Business overview with revenue, expenses, estimated profit, low stock alerts, recent orders, and recommended actions.
- **Products** — Manage finished frozen food products with batch-based stock tracking, production dates, and expiry dates.
- **Inventory** — Track raw materials, packaging, and supplies with stock levels and restock indicators.
- **Orders** — Create orders for existing or new customers, update order status and payment status, sort and search the order list.
- **Expenses** — Record and categorize business expenses with monthly summaries and breakdowns.
- **LocalStorage Persistence** — All data is saved to the browser's localStorage so it survives page refreshes.
- **Seed Data** — Ships with mock data so the app is usable immediately without manual setup.

## Tech Stack

| Technology | Purpose |
|---|---|
| [React](https://react.dev/) 19 | UI components and state management |
| [Vite](https://vite.dev/) 8 | Build tool and dev server |
| JavaScript (ES Modules) | Application logic |
| [Tailwind CSS](https://tailwindcss.com/) 3 | Utility-first styling |
| LocalStorage | Client-side data persistence |

## Project Structure

```
src/
├── app/                  # App shell, layout, routing
├── components/
│   ├── layout/           # Sidebar
│   └── ui/               # Reusable UI (Button, Card, Input)
├── data/                 # Seed/mock data for first load
├── features/
│   ├── costing/          # Cost calculation logic
│   ├── dashboard/        # Dashboard data aggregation
│   ├── expenses/         # Expenses service and logic
│   ├── inventory/        # Inventory service and logic
│   ├── orders/           # Orders service and logic
│   └── products/         # Products service and logic
├── hooks/                # Custom React hooks
├── pages/                # Page components (one per route)
├── services/
│   ├── repositories/     # Data access layer (localStorage CRUD)
│   └── storage/          # LocalStorage client and key constants
└── utils/                # Formatting helpers (currency, date)
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (comes with Node.js)

### Run Locally

```bash
# Clone the repository
git clone https://github.com/<your-username>/yummom-dashboard.git
cd yummom-dashboard

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Other Commands

```bash
npm run build     # Production build
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

## Current Status

This is an MVP (Minimum Viable Product). All data is stored in the browser's localStorage — there is no backend or database. The app ships with seed data so every feature is functional out of the box.

## Future Improvements

- Backend API and database integration
- User authentication
- Dedicated Customers page
- Order detail view with line items
- Export data to CSV or PDF
- Charts and trend visualizations
- Mobile-responsive layout improvements
- Automated testing

## Author

Richie Kosasih
