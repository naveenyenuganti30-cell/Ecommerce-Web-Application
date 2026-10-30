# ShopSphere — Full-Stack Modern E-Commerce Web Application

ShopSphere is a production-grade, full-stack E-Commerce Web Application built with **React (Vite)**, **Tailwind CSS**, **Node.js / Express**, and **MongoDB with Mongoose**.

The platform provides a complete customer shopping experience—from catalog discovery and dynamic cart management to atomic inventory-protected checkout and visual order tracking—paired with an administrator control center for real-time sales analytics, inventory monitoring, product catalog management, and order fulfillment workflows.

---

## 1. Project Overview & Features

### 🛒 Customer Storefront
- **Curated Home Page**: Modern hero showcase, category tiles, featured gear, staff picks, new arrivals, promotional alerts, and customer trust badges.
- **Product Catalog**: Live keyword search, multi-category filters, price range filter, in-stock & featured filters, sorting (Price, Newest, Name), and pagination.
- **Product Details**: Multi-angle image galleries, SKU identification, stock counters, dynamic quantity selectors, out-of-stock protections, and related gear suggestions.
- **Shopping Cart**: Real-time line item recalculations using authoritative database prices, quantity controls, automatic shipping tier calculation, and guest-to-customer cart merging upon login.
- **Atomic Checkout**: Form-validated shipping address input, Cash on Delivery (COD) and verified online payment modes, atomic stock decrements with rollback safety, and idempotency protection against duplicate orders.
- **Order Confirmation & Tracking**: Unique generated order numbers (`ORD-YYYYMMDD-XXXXXX`), live fulfillment timeline (Pending → Confirmed → Processing → Shipped → Delivered), and self-service cancellation with automatic inventory restocking.
- **Customer Account**: Profile management (name and phone updates) and personal order history.

### 🛡️ Administrator Dashboard
- **Executive Analytics**: Real-time revenue calculations (excluding cancelled orders), total orders pipeline breakdown, low-stock warnings, and recent order feeds.
- **Product CRUD**: Create, edit, and deactivate products with image URLs, SKUs, inventory counts, and featured flags. Soft-deactivates products referenced in existing orders to preserve historical integrity.
- **Category Management**: Create, update, and manage catalog categories and cover graphics.
- **Order Pipeline Control**: View all store orders, filter by fulfillment status and search queries, view recipient and item snapshots, and execute validated status transitions with audit notes.
- **Customer Directory**: View verified customer accounts, lifetime order frequencies, and total qualifying spend.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Framer Motion, Lucide React, Axios |
| **Backend** | Node.js, Express.js (REST API, ES Modules), bcryptjs, jsonwebtoken, Helmet, Express Rate Limit, Morgan |
| **Database** | MongoDB with Mongoose (with MongoDB Atlas support and seamless in-memory fallback for immediate zero-config testing) |
| **Styling** | Curated palette featuring Deep Teal (`#224248`), Teal (`#325E6A`), Aqua (`#44A1A4`), and Orange Accent (`#FF9A00`) with complete Dark Mode support |

---

## 3. Curated Design System

| Color Token | Hex Code | Primary Purpose |
|---|---|---|
| **Deep Teal** | `#224248` | Primary brand identity, headers, main navigation, and primary buttons |
| **Teal** | `#325E6A` | Sub-headers, secondary panels, badges, and card borders |
| **Aqua** | `#44A1A4` | Interactive highlights, links, active tab indicators, and accents |
| **Orange Accent** | `#FF9A00` | Call-to-action buttons, sale badges, alerts, and rating indicators |

---

## 4. Project Folder Structure

```
d:\Ecomm/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── layouts/
│   │   │   ├── StoreLayout.jsx
│   │   │   └── AdminLayout.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminProducts.jsx
│   │   │   │   ├── AdminCategories.jsx
│   │   │   │   ├── AdminOrders.jsx
│   │   │   │   └── AdminCustomers.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── CatalogPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── OrderConfirmationPage.jsx
│   │   │   ├── MyOrdersPage.jsx
│   │   │   ├── OrderTrackingPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── categoryController.js
│   │   │   ├── cartController.js
│   │   │   ├── orderController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Category.js
│   │   │   ├── Product.js
│   │   │   ├── Cart.js
│   │   │   └── Order.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── cartRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── utils/
│   │   │   ├── helpers.js
│   │   │   └── seeder.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   └── package.json
├── .env.example
├── .gitignore
├── test_apis.js
├── package.json
└── README.md
```

---

## 5. Getting Started & Installation

### Prerequisites
- Node.js (version 18 or higher recommended; tested on v24.18.0)
- npm (version 9 or higher)

### Installation
From the root workspace directory, install dependencies for both frontend and backend:

```bash
# Option 1: Using root convenience script
npm run install:all

# Option 2: Manually installing both directories
cd server && npm install
cd ../client && npm install
```

---

## 6. Environment Variables Setup

### Backend Configuration (`server/.env`)
Copy the example template or populate `server/.env`:

```env
PORT=5001
NODE_ENV=development
JWT_SECRET=shopsphere_ultra_secure_jwt_secret_token_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5174

# Optional: MongoDB Atlas or Local MongoDB connection string.
# If omitted or if local MongoDB is unreachable, an in-memory MongoDB instance
# boots automatically for frictionless zero-setup evaluation.
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/shopsphere?retryWrites=true&w=majority
```

---

## 7. Database Seeding & Demo Credentials

The backend includes an automated seeder that populates categories, realistic product catalog items with genuine Unsplash imagery, and demo user accounts:

```bash
# From workspace root:
npm run seed
```

### Pre-Configured Demo Accounts

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Administrator** | `admin@shopsphere.com` | `Admin@123` | Full `/admin` dashboard, product CRUD, inventory updates, order status changes |
| **Customer** | `customer@shopsphere.com` | `Customer@123` | Storefront browsing, cart persistence, checkout, order tracking, profile |

> **Tip:** The Login page includes **one-click demo credentials buttons** (`Demo Customer` and `Demo Admin`) to allow instant sign-in without manual typing.

---

## 8. Running the Application Locally

Start the backend API and frontend client:

```bash
# Terminal 1 — Start the Backend Server (Port 5001)
npm run server

# Terminal 2 — Start the Frontend Client (Port 5174)
npm run client
```

Open your browser at **`http://localhost:5174`**.

---

## 9. Running Verification Tests

ShopSphere includes an automated test runner verifying health, authentication, catalog search, cart calculations, atomic checkout, customer order retrieval, and admin dashboard statistics:

```bash
npm test
```

Expected output:
```text
=== ShopSphere Automated Verification Test Suite ===
✓ Health Status: ok | Service: ShopSphere API
✓ Products Retrieved: 3 of 12 total
✓ Search for "Headphones": Found 1 match(es)
✓ Logged in as: Alex Morgan (customer)
✓ Cart Items: 1 | Subtotal: ₹89 | Total: ₹139
✓ Order Created Successfully: ORD-20261027-XXXXXX
✓ Total Orders in Customer Account: 3
✓ Logged in as Admin: ShopSphere Administrator (admin)
✓ Admin Dashboard Stats:
  - Total Revenue: ₹633.49
  - Total Orders:  3
  - Total Products: 12
✓ Order Status Updated to: Confirmed
===================================================
  ALL 8 END-TO-END VERIFICATION TESTS PASSED (100%)
===================================================
```

---

## 10. REST API Reference

### Authentication
- `POST /api/auth/register` — Register a customer account (forces role to `customer`).
- `POST /api/auth/login` — Login and receive JWT bearer token.
- `GET /api/auth/me` — Retrieve current authenticated session.
- `PATCH /api/auth/profile` — Update customer name and phone.
- `POST /api/auth/logout` — Revoke session.

### Catalog
- `GET /api/products` — Retrieve products with query params (`search`, `category`, `minPrice`, `maxPrice`, `inStock`, `featured`, `sort`, `page`, `limit`).
- `GET /api/products/:id` — Retrieve product by ID.
- `GET /api/products/slug/:slug` — Retrieve product by slug along with related products.
- `GET /api/categories` — Retrieve active categories and active product counts.

### Shopping Cart (Protected)
- `GET /api/cart` — Authoritative price recalculation and item listing.
- `POST /api/cart/items` — Add product to cart (validates available stock).
- `PATCH /api/cart/items/:productId` — Update item quantity.
- `DELETE /api/cart/items/:productId` — Remove specific product.
- `DELETE /api/cart` — Clear entire shopping cart.
- `POST /api/cart/merge` — Merge guest cart into customer database cart upon login.

### Checkout & Orders (Protected)
- `POST /api/orders` — Atomic checkout with stock decrement, price snapshots, and duplicate prevention.
- `GET /api/orders/my-orders` — Customer order history.
- `GET /api/orders/:id` — Order details and status timeline (owner and admin only).
- `POST /api/orders/:id/cancel` — Cancel order (eligible only when `Pending` or `Confirmed`), restores inventory.

### Administrator Operations (Protected, Admin Only)
- `GET /api/admin/dashboard/stats` — Metrics for sales, order pipeline, product totals, and low-stock alerts.
- `GET /api/admin/products` — Admin product table with stock status filters.
- `POST /api/admin/products` — Create new product.
- `PATCH /api/admin/products/:id` — Update product details, price, SKU, and stock count.
- `DELETE /api/admin/products/:id` — Delete product or safely deactivate if historical orders reference it.
- `POST /api/admin/categories` — Create category.
- `PATCH /api/admin/categories/:id` — Update category.
- `DELETE /api/admin/categories/:id` — Delete/deactivate category.
- `GET /api/admin/orders` — Admin order table with status and keyword filters.
- `GET /api/admin/orders/:id` — Inspect full order details.
- `PATCH /api/admin/orders/:id/status` — Validate and transition order status (`Pending` → `Confirmed` → `Processing` → `Shipped` → `Delivered` or `Cancelled`).
- `GET /api/admin/customers` — Customer directory with order frequency and total spend.

---

## 11. Deployment Guide

### Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and allowlist connection IP addresses (`0.0.0.0/0` for cloud deployments).
3. Copy the connection URI:
   ```text
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/shopsphere?retryWrites=true&w=majority
   ```

### Backend (Render / Railway)
1. Connect repository to [Render](https://render.com).
2. Configure **Root Directory**: `server`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node src/server.js`
5. Configure Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `JWT_SECRET=<strong-random-key>`
   - `MONGODB_URI=<your-atlas-uri>`
   - `CLIENT_URL=https://your-shopsphere-client.vercel.app`

### Frontend (Vercel)
1. Connect repository to [Vercel](https://vercel.com).
2. Configure **Root Directory**: `client`
3. Set **Framework Preset**: `Vite`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. Add Environment Variable:
   - `VITE_API_BASE_URL=https://your-shopsphere-server.onrender.com/api`

---

## 12. License & Author

Crafted for college project submission, engineering portfolios, and production deployment demonstrations.
All rights reserved © 2026 ShopSphere.
