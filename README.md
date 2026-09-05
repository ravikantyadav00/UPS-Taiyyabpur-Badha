# Multi-Tenant School Management System — Phase 1

An enterprise-ready, modular multi-tenant **School Management System** built with Node.js, NestJS, Prisma ORM, PostgreSQL, Next.js 14, and Tailwind CSS.

---

## 🌟 Key Features (Phase 1)

* **Multi-Tenant Scoping**: All entities are scoped via `school_id`. Reusable `SchoolIsolationGuard` prevents cross-school data leaks.
* **Authentication**: Production-grade JWT system with short-lived access tokens, long-lived refresh tokens, refresh token rotation, and bcrypt password hashing.
* **Role-Based Access Control (RBAC)**: Reusable `@Roles(Role.ADMIN)` decorators and `RolesGuard` protecting endpoints.
* **OpenAPI / Swagger Documentation**: Available at `/api/docs` with Bearer Auth support.
* **Audit Logging**: Persistent `AuditLog` service tracking user login, logout, and system seed events.
* **Next.js Web Admin Portal**: Modern glassmorphic dashboard UI with live School Profile fetching and auth state management.
* **Health Check**: `GET /api/health` validating server health and database connection.

---

## 🚀 Technology Stack

### Backend
* **Runtime & Framework**: Node.js, TypeScript, NestJS
* **ORM & Database**: Prisma ORM, PostgreSQL 16
* **Security & Auth**: Passport-JWT, Bcrypt, Helmet, Cookie-Parser, Throttler (Rate-limiting)
* **API Documentation**: Swagger / OpenAPI 3.0

### Web Frontend
* **Framework**: Next.js 14 (App Router), React 18, TypeScript
* **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism design system

### Infrastructure & Tooling
* **Monorepo**: npm workspaces
* **Containerization**: Docker, Docker Compose
* **Testing & Linting**: Jest, ESLint, Prettier

---

## 📁 Repository Structure

```text
school-management/
├── apps/
│   ├── backend/            # NestJS REST API Server
│   │   ├── prisma/         # Schema & seed scripts
│   │   ├── src/            # Auth, Users, Schools, Audit, Health modules
│   │   └── test/           # Unit & E2E integration test suites
│   └── web/                # Next.js 14 Admin Frontend
│       ├── app/            # App router pages (/login, /dashboard, /dashboard/school)
│       ├── components/     # UI components (Sidebar, Navbar, StatsCard)
│       └── lib/            # API client and Auth context
├── packages/
│   └── shared/             # Shared TypeScript types & enums (@school/shared)
├── docker-compose.yml      # PostgreSQL, Backend, and Web services
├── .env.example            # Environment template
└── package.json            # Monorepo workspaces configuration
```

---

## 🛠️ Prerequisites

* **Node.js**: v18+ or v20+
* **Docker & Docker Compose**: (Recommended for PostgreSQL containerization)
* **PostgreSQL**: v16+ (If running locally without Docker)

---

## ⚙️ Quick Start Guide

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd school-management
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default `.env` configuration:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/school_management?schema=public"
JWT_ACCESS_SECRET="super-secret-access-token-key-change-in-production-12345"
JWT_REFRESH_SECRET="super-secret-refresh-token-key-change-in-production-67890"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
ADMIN_EMAIL="admin@school.com"
ADMIN_PASSWORD="AdminSecret123!"
SCHOOL_NAME="Greenwood High School"
SCHOOL_CODE="GHS001"
```

### 3. Start PostgreSQL Database

Using Docker Compose:

```bash
docker compose up -d postgres
```

### 4. Run Migrations & Seed Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Execute database migrations
npm run prisma:migrate

# Seed initial School and Admin user
npm run prisma:seed
```

Default Seed Admin Credentials:
* **Email**: `admin@school.com`
* **Password**: `AdminSecret123!`

---

## 💻 Running the Application

### Development Mode

Run backend and web applications concurrently:

```bash
npm run dev
```

* **Web Admin Portal**: [http://localhost:3000](http://localhost:3000)
* **Backend REST API**: [http://localhost:3001/api](http://localhost:3001/api)
* **Swagger OpenAPI Docs**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
* **Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

### Docker Full Stack Deployment

Run PostgreSQL, NestJS Backend, and Next.js Web in Docker:

```bash
docker compose up --build -d
```

---

## 🧪 Testing & Code Quality

```bash
# Run backend unit tests
npm run test

# Run TypeScript type-check across monorepo
npm run type-check

# Run production build
npm run build
```

---

## 🔒 Security Measures

1. **Password Hashing**: Passwords stored using `bcrypt` with salt factor 12.
2. **Token Security**: Refresh tokens stored hashed in DB and rotated on refresh. Access tokens are short-lived.
3. **Data Scoping**: Every query is strictly isolated to the authenticated user's `school_id`.
4. **Header Protection**: Secured with Helmet HTTP headers and strict CORS origin validation.
