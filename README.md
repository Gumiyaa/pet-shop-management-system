# 🐾 PetShop - Pet Store Management System

A comprehensive, production-ready pet store management system built with Next.js 15, TypeScript, and PostgreSQL. Designed for portfolio demonstration and real-world usage.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D2D2D)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8)

## ✨ Features

### 🔐 Authentication
- Secure login with NextAuth.js
- JWT-based session management
- Role-based access control (Admin & Cashier)
- Middleware protection for all routes

### 📊 Dashboard
- Real-time store statistics
- Monthly revenue charts (Recharts)
- Low stock alerts
- Recent transactions overview

### 📦 Product Management
- Full CRUD operations
- Search, pagination, and filtering
- Category management
- Stock tracking with min stock alerts
- Barcode support
- Image upload support

### 👥 Customer Management
- Full CRUD operations
- Search and pagination
- Purchase history per customer

### 🏢 Supplier Management
- Full CRUD operations
- Search and pagination

### 💰 Sales Transaction (POS)
- Interactive cart system
- Product search with instant results
- Quantity management
- Discount and tax calculations
- Multiple payment methods (Cash, Card, Transfer)
- Automatic change calculation
- Invoice generation

### 📋 Stock Management
- Stock In / Stock Out tracking
- Complete movement history
- Low stock dashboard with alerts
- User attribution for all movements

### 📈 Reports & Analytics
- Daily, weekly, monthly reports
- Custom date range selection
- Revenue charts
- Top products ranking
- PDF export (jsPDF)
- Excel export (SheetJS)

### ⚙️ Settings
- Store information management
- Dark / Light mode toggle
- User management (Admin only)
- Role assignment

### 🎨 UI/UX
- Modern dashboard design
- shadcn/ui components
- Responsive (Desktop, Tablet, Mobile)
- Dark mode support
- Loading states & skeletons
- Toast notifications
- Optimistic UI patterns

## 🏗️ Architecture

```
app/                    # Next.js App Router pages
├── api/auth/           # NextAuth API routes
├── dashboard/          # Dashboard page
├── products/           # Product management
├── customers/          # Customer management
├── suppliers/          # Supplier management
├── sales/              # POS & sales history
├── stock/              # Stock movements
├── reports/            # Reports & exports
├── settings/           # Store settings & users
├── login/              # Login page
└── layout.tsx          # Root layout with sidebar

components/             # Shared UI components
├── ui/                 # shadcn/ui components
├── sidebar.tsx         # Navigation sidebar
└── data-table.tsx      # Reusable data table

features/               # Feature modules (Clean Architecture)
├── dashboard/          # Dashboard logic
├── products/           # Product logic
├── customers/          # Customer logic
├── suppliers/          # Supplier logic
├── sales/              # Sales logic
├── stock/              # Stock logic
├── reports/            # Report logic
└── settings/           # Settings logic

lib/                    # Shared utilities
├── auth.ts             # NextAuth configuration
├── prisma.ts           # Prisma client singleton
├── utils.ts            # Utility functions
├── validations.ts      # Zod schemas
└── theme-context.tsx   # Theme provider

prisma/                 # Database
├── schema.prisma       # Database schema
└── seed.ts             # Seed data

types/                  # TypeScript types
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/petshop.git
cd petshop

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Environment Variables

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/petshop"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Login Credentials

| Role     | Email                | Password    |
|----------|----------------------|-------------|
| Admin    | admin@petshop.com    | admin123    |
| Cashier  | cashier@petshop.com  | cashier123  |

## 🛠️ Tech Stack

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| Framework   | Next.js 15 (App Router)                        |
| Language    | TypeScript (strict mode)                       |
| Styling     | TailwindCSS 4                                  |
| Components  | shadcn/ui + Radix UI                           |
| Forms       | React Hook Form + Zod                          |
| Tables      | TanStack Table                                 |
| Charts      | Recharts                                       |
| Database    | PostgreSQL + Prisma ORM                        |
| Auth        | NextAuth.js (Auth.js v5)                      |
| Toast       | react-hot-toast                                |
| PDF Export  | jsPDF + jspdf-autotable                        |
| Excel Export| SheetJS (xlsx)                                 |
| Storage     | Supabase Storage                               |
| Deployment  | Vercel                                         |

## 📦 Database Schema

The database is fully normalized with proper foreign keys and indexes:

- **User** - System users with role-based access (Admin, Cashier)
- **Product** - Inventory with categories, suppliers, stock tracking
- **Customer** - Customer profiles with purchase tracking
- **Supplier** - Product suppliers
- **Sale** / **SaleItem** - Transaction records with line items
- **StockMovement** - Complete audit trail for inventory changes
- **Store** - Store configuration and settings
- **Category** - Product categorization

## 🔒 Access Control

| Feature        | Admin | Cashier |
|----------------|-------|---------|
| Dashboard      | ✅    | ✅      |
| Products (RUD) | ✅    | ✅ (RU) |
| Customers      | ✅    | ✅      |
| Suppliers      | ✅    | ❌      |
| Sales          | ✅    | ✅      |
| Stock          | ✅    | ❌      |
| Reports        | ✅    | ❌      |
| Settings       | ✅    | ❌      |
| Delete Product | ✅    | ❌      |
| Delete User    | ✅    | ❌      |

## 📄 License

MIT License

---

Built with ❤️ for pet lovers everywhere.