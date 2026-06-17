import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { formatINRForPDF } from '@/lib/gst';


interface PDFLineItem {
  name: string;
  qty: number;
  rate: number;
  gstRate: number;
  taxable: number;
  tax: number;
  total: number;
}

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

    // Build PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { height } = page.getSize();

    const dark = rgb(0.1, 0.1, 0.1);
    const gray = rgb(0.45, 0.45, 0.45);
    const lineColor = rgb(0.85, 0.85, 0.85);
    const accent = rgb(0.23, 0.39, 0.92);

    let y = height - 50;
    const lm = 50; // left margin
    const rm = 545; // right margin

    // ---- Title ----
    page.drawText('GST INVOICE', {
      x: lm,
      y,
      size: 20,
      font: fontBold,
      color: dark,
    });

    y -= 22;
    page.drawText(`Invoice No: ${invoice.invoiceNo}`, {
      x: lm,
      y,
      size: 10,
      font,
      color: gray,
    });
    page.drawText(`Date: ${invoice.date}`, {
      x: 400,
      y,
      size: 10,
      font,
      color: gray,
    });

    // ---- Horizontal line ----
    y -= 15;
    page.drawLine({
      start: { x: lm, y },
      end: { x: rm, y },
      thickness: 1,
      color: lineColor,
    });

    // ---- From / To ----
    y -= 25;
    page.drawText('From', { x: lm, y, size: 9, font, color: gray });
    page.drawText('Bill To', { x: 310, y, size: 9, font, color: gray });

    y -= 16;
    page.drawText(invoice.businessName, {
      x: lm,
      y,
      size: 11,
      font: fontBold,
      color: dark,
    });
    page.drawText(invoice.customerName, {
      x: 310,
      y,
      size: 11,
      font: fontBold,
      color: dark,
    });

    y -= 15;
    page.drawText(`GSTIN: ${invoice.gstin}`, {
      x: lm,
      y,
      size: 9,
      font,
      color: gray,
    });
    if (invoice.customerGstin) {
      page.drawText(`GSTIN: ${invoice.customerGstin}`, {
        x: 310,
        y,
        size: 9,
        font,
        color: gray,
      });
    }

    y -= 12;
    page.drawText(
      `Supply Type: ${invoice.supplyType === 'intra' ? 'Intra-State' : 'Inter-State'}`,
      { x: lm, y, size: 9, font, color: gray },
    );

    // ---- Line items header ----
    y -= 30;
    page.drawLine({
      start: { x: lm, y: y + 5 },
      end: { x: rm, y: y + 5 },
      thickness: 1,
      color: lineColor,
    });

    const cols = [
      { label: '#', x: lm, w: 25 },
      { label: 'Item', x: 75, w: 160 },
      { label: 'Qty', x: 240, w: 45 },
      { label: 'Rate', x: 290, w: 65 },
      { label: 'GST%', x: 360, w: 45 },
      { label: 'Tax', x: 410, w: 60 },
      { label: 'Total', x: 475, w: 70 },
    ];

    cols.forEach((c) => {
      page.drawText(c.label, {
        x: c.x,
        y,
        size: 9,
        font: fontBold,
        color: gray,
      });
    });

    y -= 8;
    page.drawLine({
      start: { x: lm, y },
      end: { x: rm, y },
      thickness: 0.5,
      color: lineColor,
    });

    // ---- Line items ----
    const lineItems = invoice.lineItems as unknown as PDFLineItem[];
    lineItems.forEach((item, idx) => {
      y -= 18;
      page.drawText(`${idx + 1}`, { x: lm, y, size: 9, font, color: dark });
      page.drawText(item.name.substring(0, 28), {
        x: 75,
        y,
        size: 9,
        font,
        color: dark,
      });
      page.drawText(`${item.qty}`, { x: 240, y, size: 9, font, color: dark });
      page.drawText(formatINRForPDF(item.rate), {
        x: 290,
        y,
        size: 9,
        font,
        color: dark,
      });
      page.drawText(`${item.gstRate}%`, {
        x: 360,
        y,
        size: 9,
        font,
        color: dark,
      });
      page.drawText(formatINRForPDF(item.tax), {
        x: 410,
        y,
        size: 9,
        font,
        color: dark,
      });
      page.drawText(formatINRForPDF(item.total), {
        x: 475,
        y,
        size: 9,
        font: fontBold,
        color: dark,
      });
    });

    // ---- Summary ----
    y -= 25;
    page.drawLine({
      start: { x: lm, y },
      end: { x: rm, y },
      thickness: 1,
      color: lineColor,
    });

    y -= 20;
    const summaryLabelX = 370;
    const summaryValueX = 475;

    page.drawText('Subtotal:', {
      x: summaryLabelX,
      y,
      size: 10,
      font,
      color: gray,
    });
    page.drawText(formatINRForPDF(invoice.subtotal), {
      x: summaryValueX,
      y,
      size: 10,
      font,
      color: dark,
    });

    if (invoice.supplyType === 'intra') {
      y -= 18;
      page.drawText('CGST:', {
        x: summaryLabelX,
        y,
        size: 10,
        font,
        color: gray,
      });
      page.drawText(formatINRForPDF(invoice.cgst), {
        x: summaryValueX,
        y,
        size: 10,
        font,
        color: dark,
      });

      y -= 18;
      page.drawText('SGST:', {
        x: summaryLabelX,
        y,
        size: 10,
        font,
        color: gray,
      });
      page.drawText(formatINRForPDF(invoice.sgst), {
        x: summaryValueX,
        y,
        size: 10,
        font,
        color: dark,
      });
    } else {
      y -= 18;
      page.drawText('IGST:', {
        x: summaryLabelX,
        y,
        size: 10,
        font,
        color: gray,
      });
      page.drawText(formatINRForPDF(invoice.igst), {
        x: summaryValueX,
        y,
        size: 10,
        font,
        color: dark,
      });
    }

    y -= 12;
    page.drawLine({
      start: { x: summaryLabelX, y },
      end: { x: rm, y },
      thickness: 1,
      color: lineColor,
    });

    y -= 20;
    page.drawText('Grand Total:', {
      x: summaryLabelX,
      y,
      size: 12,
      font: fontBold,
      color: dark,
    });
    page.drawText(formatINRForPDF(invoice.grandTotal), {
      x: summaryValueX,
      y,
      size: 12,
      font: fontBold,
      color: accent,
    });

    // ---- Footer ----
    y -= 50;
    page.drawLine({
      start: { x: lm, y },
      end: { x: rm, y },
      thickness: 0.5,
      color: lineColor,
    });

    y -= 15;
    page.drawText('Generated by GST Invoice Calculator', {
      x: lm,
      y,
      size: 8,
      font,
      color: gray,
    });
    page.drawText('Built for Digital Heroes — digitalheroesco.com', {
      x: 350,
      y,
      size: 8,
      font,
      color: gray,
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoiceNo}.pdf"`,
        'Content-Length': String(pdfBytes.length),
      },
    });
  } catch (err) {
    console.error('[GET /api/invoices/[id]/pdf] Error:', err);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    );
  }
}
