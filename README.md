# 🐾 Pet Shop Management System

A modern **Pet Shop Management System** built with **Next.js 15**, **TypeScript**, **Prisma**, and **PostgreSQL** to simplify daily business operations such as product management, inventory tracking, sales transactions, supplier management, and business reporting.

![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)
![NextAuth](https://img.shields.io/badge/Auth.js-000000?style=for-the-badge&logo=auth0)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-111111?style=for-the-badge)

---

## 📸 Application Preview


<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/63f965df-5b17-471d-92f5-7097aef60b79" />

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/1e42abf7-f3ca-4a6a-9a4f-da59db2745be" />

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/ea5b207c-52eb-4c54-babb-9c5cde99f013" />

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/68239034-b549-4bd8-b073-ea261467fc4f" />

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/d3f33daf-4740-4fe5-8331-8550ccfb1730" />

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/f592472c-bcd0-44d0-b2f6-6a05fe3d3858" />

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/26794d8b-7369-43e6-9702-43d43d991aca" />

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/60ae0c65-65f9-4754-8c4b-a65e35ad3550" />

---

<details>
<summary><strong>📖 Dokumen Lengkap</strong> — Fitur, Cara Menjalankan, Struktur Folder, & lainnya</summary>

# ✨ Features

### 🔐 Authentication

Secure user authentication with role-based access to protect application data.

### 📊 Dashboard

Monitor business performance through an interactive dashboard with sales summaries, stock information, and important statistics.

### 📦 Product Management

Manage pet products including adding, updating, deleting, and organizing product information.

### 📦 Stock Management

Track inventory levels and monitor stock availability to avoid shortages.

### 👥 Supplier Management

Maintain supplier information and simplify product procurement.

### 💰 Sales Management

Record sales transactions quickly while keeping inventory synchronized automatically.

### 📈 Reports

Generate business reports to analyze sales performance and inventory movement.

### ⚙️ Settings

Manage application configuration and user preferences.

---

# 🛠 Tech Stack

| Technology | Description |
|------------|-------------|
| Next.js 15 | React Full Stack Framework |
| React 19 | User Interface Library |
| TypeScript | Static Type Checking |
| Tailwind CSS | Utility-first CSS Framework |
| Prisma ORM | Database ORM |
| PostgreSQL | Relational Database |
| NextAuth / Auth.js | Authentication |
| shadcn/ui | UI Components |
| Lucide React | Icon Library |

---

# 📁 Project Structure

```text
pet-shop-management-system/
│
├── app/                # App Router pages & API routes
├── prisma/             # Prisma schema & database seed
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature modules
│   ├── lib/            # Utilities & configurations
│   └── types/          # Global TypeScript types
│
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Gumiyaa/pet-shop-management-system.git
```

Move into the project directory.

```bash
cd pet-shop-management-system
```

Install dependencies.

```bash
npm install
```

Configure your environment variables.

```env
DATABASE_URL=
AUTH_SECRET=
NEXTAUTH_URL=
```

Generate Prisma Client.

```bash
npx prisma generate
```

Run database migrations.

```bash
npx prisma migrate dev
```

Start the development server.

```bash
npm run dev
```

Open your browser.

```
http://localhost:3000
```

---

# 💻 Built With

- Next.js App Router
- React
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- shadcn/ui

---

# 🎯 Future Improvements

- Dashboard analytics visualization
- Export reports to PDF & Excel
- Multi-user role management
- Notification system
- Responsive mobile interface
- Product image upload

---

# 👨‍💻 Author

**Gumilang Atmaja**

GitHub

https://github.com/Gumiyaa

---

## ⭐ Support

If you find this project helpful, consider giving it a **⭐ Star** on GitHub.

</details>
