import { NextResponse } from 'next/server';
export async function backendProxy(req: Request, path: string) {
  const cookie = req.headers.get('cookie')?.match(/(?:^|;\s*)abo_admin_token=([^;]+)/);
  const authorization =
    req.headers.get('authorization') || (cookie ? `Bearer ${decodeURIComponent(cookie[1])}` : '');
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  try {
    const upstream = await fetch(`${base.replace(/\/$/, '')}/api/${path}`, {
      method: req.method,
      headers: { Authorization: authorization, 'Content-Type': 'application/json' },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.text(),
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    });
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
