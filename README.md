# 🍔 Full-Stack Food Ordering & Management System

A modern, high-performance full-stack food ordering platform built with **Next.js 14 (App Router)**, **TypeScript**, **Prisma ORM**, **NextAuth.js**, and **Stripe**. Designed for seamless user experience, secure payment workflows, and real-time order state mutations using React Server Actions.

---

## 🌟 Key Features

- **⚡ Next.js App Router Architecture:** Utilizes Server Components for minimal client bundle size and instant initial load.
- **🔒 Multi-Provider Authentication:** Secure login flows powered by **NextAuth.js** with OAuth providers and credentials.
- **🛒 Dynamic Cart & Checkout:** Seamless cart experience integrated with **Stripe API** for secure payment processing and webhook handling.
- **🗄️ Relational Database Management:** Structured relational schema managed via **Prisma ORM** with automated migrations and type safety.
- **🛡️ Strict Type Safety & Validation:** End-to-end data safety using **TypeScript** and **Zod** schema validation across server actions and forms.
- **📱 Responsive & Fast UI:** Styled with **Tailwind CSS**, optimized with `next/image`, achieving top-tier Core Web Vitals.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router & Server Actions)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database & ORM:** [Prisma ORM](https://www.prisma.io/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Payments:** [Stripe API](https://stripe.com/)
- **Form Validation:** [Zod](https://zod.dev/)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (v18+) and npm, yarn, or pnpm installed on your machine.

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/zszoshosha/food-ordering-app.git](https://github.com/zszoshosha/food-ordering-app.git)
   cd food-ordering-app

1- Install dependencies

-----Bash----
npm install
2- Set up Environment Variables:
Create a .env file in the root directory and configure your keys:

DATABASE_URL="postgresql://user:password@localhost:5432/food_db?schema=public"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"


3-Run Database Migrations:

-----Bash----
npx prisma db push


4- Start the Development Server:

-------Bash-----
npm run dev


5-View the Application:
Open http://localhost:3000 with your browser to see the live app running locally.
