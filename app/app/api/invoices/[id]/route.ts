import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(invoice, { status: 200 });
  } catch (err) {
    console.error('[GET /api/invoices/[id]] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 },
    );
  }
}
