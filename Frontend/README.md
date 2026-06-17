# GST Invoice Calculator

A production-ready, full-stack GST Invoice Calculator built with Next.js 14 (App Router), Tailwind CSS, Prisma ORM, and MongoDB.

## Features
- **Live GST Calculation**: Calculates CGST, SGST, IGST in real-time as you type.
- **Server-Side Source of Truth**: Calculation logic runs securely on the backend.
- **PDF Generation**: Download professional PDF invoices instantly using `pdf-lib`.
- **Database Storage**: Save invoices to MongoDB and generate shareable links.
- **Responsive Design**: Beautiful, mobile-first single-column UI.
- **LocalStorage Support**: Preserves form state across page reloads.

## Architecture
- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Next.js API routes (`/app/api`)
- **Database**: MongoDB via Prisma ORM
- **PDF Generation**: `pdf-lib`

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Rename `.env.example` to `.env.local` and add your MongoDB connection string.

3. **Prisma Setup**
   ```bash
   npx prisma generate
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to `http://localhost:3000`

## Deployment
This application is fully optimized for deployment on the **Vercel Free (Hobby) Plan**.
1. Push your code to GitHub.
2. Import the project in Vercel.
3. Add `DATABASE_URL` to the Environment Variables in Vercel settings.
4. Deploy!

Built for Digital Heroes.
