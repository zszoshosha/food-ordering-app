🍔 Full-Stack Food Ordering & Management System
A modern, high-performance full-stack food ordering platform built with Next.js 14 (App Router), TypeScript, Prisma ORM, NextAuth.js, and Stripe. Designed for seamless user experience, secure payment workflows, and real-time order state mutations using React Server Actions.

🌟 Key Features
⚡ Next.js App Router Architecture: Utilizes Server Components for minimal client bundle size and instant initial load.

🔒 Multi-Provider Authentication: Secure login flows powered by NextAuth.js with OAuth providers and credentials.

🛒 Dynamic Cart & Checkout: Seamless cart experience integrated with Stripe API for secure payment processing and webhook handling.

🗄️ Relational Database Management: Structured relational schema managed via Prisma ORM with automated migrations and type safety.

🛡️ Strict Type Safety & Validation: End-to-end data safety using TypeScript and Zod schema validation across server actions and forms.

📱 Responsive & Fast UI: Styled with Tailwind CSS, optimized with next/image, achieving top-tier Core Web Vitals.

🛠️ Tech Stack
Framework: Next.js 14 (App Router & Server Actions)

Language: TypeScript

Styling: Tailwind CSS

Database & ORM: Prisma ORM

Authentication: NextAuth.js

Payments: Stripe API

Form Validation: Zod

🚀 Getting Started
Prerequisites
Ensure you have Node.js (v18+) and npm, yarn, or pnpm installed on your machine.

Installation & Local Setup
Clone the repository:

git clone https://github.com/zszoshosha/food-ordering-app.git
cd food-ordering-app

Install dependencies:

npm install

Set up Environment Variables:
Create a .env file in the root directory and configure your keys:

DATABASE_URL="postgresql://user:password@localhost:5432/food_db?schema=public"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"

Run Database Migrations:

npx prisma db push

Start the Development Server:

npm run dev

View the Application:
Open http://localhost:3000 with your browser to explore the platform locally.
