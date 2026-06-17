import { NextRequest, NextResponse } from 'next/server';
import { calculateGST, LineItemInput, SupplyType } from '@/lib/gst';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lineItems, supplyType } = body as {
      lineItems: LineItemInput[];
      supplyType: SupplyType;
    };

    if (!Array.isArray(lineItems)) {
      return NextResponse.json(
        { error: 'lineItems must be an array' },
        { status: 400 },
      );
    }

    if (supplyType !== 'intra' && supplyType !== 'inter') {
      return NextResponse.json(
        { error: 'supplyType must be "intra" or "inter"' },
        { status: 400 },
      );
    }

    const result = calculateGST(lineItems, supplyType);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[/api/calculate] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
