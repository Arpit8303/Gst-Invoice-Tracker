# GST Invoice Calculator

A production-ready, full-stack GST Invoice Calculator built with Next.js 14 (App Router), Tailwind CSS, Prisma ORM, and MongoDB. Create invoices, see live GST breakdowns, download PDFs, and share invoices via a unique link — all for free.

**Live demo:** [your-vercel-url-here](https://your-app.vercel.app)
**GitHub repo:** [your-repo-url-here](https://github.com/your-username/your-repo)

---

## Features

- **Live GST calculation** — CGST, SGST, and IGST update in real time as you type
- **Server-side source of truth** — all tax math runs in a secured API route, not just the browser
- **PDF generation** — download a clean, professional invoice PDF instantly via `pdf-lib`
- **Database storage** — save any invoice to MongoDB and get a shareable, read-only link
- **Intra-state / inter-state toggle** — automatically switches between CGST+SGST and IGST
- **Responsive design** — mobile-first, single-column layout that works on any screen
- **Local storage support** — form state survives page reloads, so you never lose your draft

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | Next.js API routes (`/app/api`) |
| Database | MongoDB, via Prisma ORM |
| PDF generation | `pdf-lib` |
| Deployment | Vercel (Hobby / free plan) |

---

## API routes

| Method | Path | Description |
|---|---|---|
| POST | `/api/calculate` | Returns GST breakdown for a set of line items |
| POST | `/api/invoices` | Saves an invoice to the database, returns its ID |
| GET | `/api/invoices/[id]` | Fetches a saved invoice |
| GET | `/api/invoices/[id]/pdf` | Streams a generated PDF of the invoice |

---

## Getting started

### Prerequisites
- Node.js 18+
- npm or yarn
- A free MongoDB Atlas cluster (or any MongoDB connection string)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env.local` and add your MongoDB connection string:
   ```bash
   cp .env.example .env.local
   ```
   ```env
   DATABASE_URL="mongodb+srv://<user>:<password>@<cluster-url>/gst-invoice?retryWrites=true&w=majority"
   ```

4. **Generate the Prisma client**
   ```bash
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Deployment

This app is built to run entirely on free tiers — no card required anywhere.

1. Push your code to a public GitHub repo.
2. Import the repo into [Vercel](https://vercel.com) (Hobby plan).
3. In Vercel → Project Settings → Environment Variables, add `DATABASE_URL` with your MongoDB connection string.
4. Deploy. Vercel will build and host the app automatically.
5. Visit your live `.vercel.app` URL to confirm everything works end to end.

---

## Project structure

```
app/
├── layout.tsx
├── page.tsx                  # main invoice builder
├── invoice/[id]/page.tsx     # read-only saved invoice view
└── api/
    ├── calculate/route.ts
    ├── invoices/route.ts
    └── invoices/[id]/
        ├── route.ts
        └── pdf/route.ts
components/
├── Header.tsx
├── InvoiceForm.tsx
├── LineItemRow.tsx
├── SummaryCard.tsx
└── Footer.tsx
lib/
├── db.ts                     # Prisma client singleton
└── gst.ts                    # GST calculation helpers
prisma/
└── schema.prisma
```

---

## Author

**[   Arpit Tiwari]**
[arpittiwari1200@gmail.com)

---

Built for [Digital Heroes](https://digitalheroesco.com)
