import { NextResponse } from 'next/server';

// All order creation uses the same pricing, proof and inventory authority.
export async function POST(req: Request) {
  const backend = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  try {
    const upstream = await fetch(`${backend.replace(/\/$/, '')}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Checkout-Token': req.headers.get('X-Checkout-Token') || '',
        'Idempotency-Key': req.headers.get('Idempotency-Key') || '',
      },
      body: await req.text(),
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    });
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'تعذر الاتصال بخدمة الطلبات.' }, { status: 503 });
  }
}
