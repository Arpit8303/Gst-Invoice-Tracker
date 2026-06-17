import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GST Invoice Calculator — Free Online GST Invoice Generator',
  description:
    'Generate professional GST invoices instantly. Calculate CGST, SGST, IGST with automatic tax breakdowns. Free, no signup required. Built for Digital Heroes.',
  keywords: [
    'GST invoice',
    'GST calculator',
    'CGST SGST calculator',
    'invoice generator India',
    'free GST tool',
  ],
  authors: [{ name: 'Arpit Tiwari', url: 'mailto:arpittiwari1200@gmail.com' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f5f6f8]">{children}</body>
    </html>
  );
}
