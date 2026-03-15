# StockPulse — Military Inventory Management System

Система управління логістикою військових складів, побудована на **Next.js 16** (App Router) з підтримкою деплою на **Netlify**.

## Стек технологій

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v3
- **UI Components**: shadcn/ui (Radix UI), Lucide Icons
- **State Management**: TanStack Query v5
- **Forms**: React Hook Form + Zod validation
- **Auth**: iron-session (cookie-based sessions)
- **Storage**: In-Memory (прототип; скидається при перезапуску/cold start)
- **Deployment**: Netlify з @netlify/plugin-nextjs

## Запуск локально

```bash
npm install
npm run dev
```

Відкрити [http://localhost:3000](http://localhost:3000)

**Дані для входу:**
- Логін: `admin`
- Пароль: `admin123`

## Збірка

```bash
npm run build
```

## Деплой на Netlify

1. Завантажити репозиторій на GitHub
2. Підключити репозиторій до Netlify
3. Netlify автоматично підхопить `netlify.toml` та зберe проєкт
4. Встановити `SESSION_SECRET` у Environment Variables Netlify

Або через Netlify CLI:
```bash
npx netlify-cli deploy --prod
```

## Структура проєкту

```
src/
├── app/
│   ├── api/                  # API Route Handlers (backend)
│   │   ├── auth/
│   │   │   ├── login/        # POST /api/auth/login
│   │   │   ├── logout/       # POST /api/auth/logout
│   │   │   └── me/           # GET /api/auth/me
│   │   ├── products/         # CRUD /api/products
│   │   ├── categories/       # GET /api/categories
│   │   ├── stats/            # GET /api/stats
│   │   └── users/            # CRUD /api/users (admin)
│   ├── globals.css           # Tailwind CSS + тема
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Entry point (auth gate)
├── components/
│   ├── pages/                # Page components
│   │   ├── login.tsx
│   │   ├── dashboard.tsx
│   │   ├── products.tsx
│   │   ├── product-form.tsx
│   │   └── users.tsx
│   ├── ui/                   # shadcn/ui components
│   ├── app-shell.tsx         # Layout з sidebar
│   └── providers.tsx         # React Query + Auth providers
├── hooks/
│   ├── use-auth.tsx          # Auth context + hooks
│   └── use-toast.ts          # Toast notifications
└── lib/
    ├── auth.ts               # iron-session auth helpers
    ├── queryClient.ts        # TanStack Query config
    ├── schema.ts             # Types, Zod schemas, constants
    ├── storage.ts            # In-Memory storage (singleton)
    └── utils.ts              # cn() helper
```

## Особливості

- **Військовий профіль**: 21 звання ЗСУ, 5 рівнів допуску, позивний, підрозділ
- **Ролі**: admin (повний доступ) та user (тільки продукти)
- **Dashboard**: статистика, алерти low stock / out of stock
- **Products**: CRUD, пошук, фільтр категорій, сортування
- **Users**: створення/редагування/видалення (тільки admin)
- **Dark mode**: підтримка темної теми
- **Cookie-based auth**: iron-session (серверна сесія)

## Відмінності від Express-версії

| Express + Vite (попередня)     | Next.js (поточна)              |
|-------------------------------|-------------------------------|
| Express routes                | Next.js Route Handlers        |
| passport + express-session    | iron-session                  |
| wouter (hash routing)         | Client-side state routing     |
| Vite dev server               | Next.js Turbopack             |
| `__PORT_5000__` proxy         | Same-origin API calls         |
| Manual build script           | `next build`                  |

## Обмеження прототипу

- In-Memory storage скидається при кожному перезапуску сервера
- На Netlify serverless — storage скидається при cold start
- Для production потрібна база даних (PostgreSQL з Drizzle ORM)
