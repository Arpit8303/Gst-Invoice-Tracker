import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { calculateGST, LineItemInput, SupplyType } from '@/lib/gst';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      invoiceNo,
      date,
      businessName,
      gstin,
      customerName,
      customerGstin,
      supplyType,
      lineItems,
    } = body as {
      invoiceNo: string;
      date: string;
      businessName: string;
      gstin: string;
      customerName: string;
      customerGstin?: string;
      supplyType: SupplyType;
      lineItems: LineItemInput[];
    };

    // Validate required fields
    if (!businessName || !gstin || !customerName || !invoiceNo || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: businessName, gstin, customerName, invoiceNo, date' },
        { status: 400 },
      );
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'At least one line item is required' },
        { status: 400 },
      );
    }

    // Compute totals server-side (source of truth)
    const { items: calculatedItems, totals } = calculateGST(lineItems, supplyType);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        date,
        businessName,
        gstin,
        customerName,
        customerGstin: customerGstin || null,
        supplyType,
        lineItems: calculatedItems as object[],
        subtotal: totals.subtotal,
        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: totals.igst,
        grandTotal: totals.grandTotal,
      },
    });

    return NextResponse.json({ id: invoice.id }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/invoices] Error:', err);
    return NextResponse.json(
      { error: 'Failed to save invoice' },
      { status: 500 },
    );
  }
}
