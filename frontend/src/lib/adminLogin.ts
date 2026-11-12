import { NextResponse } from 'next/server';
export async function adminLogin(req: Request) {
  try {
    const backend = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${backend.replace(/\/$/, '')}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: await req.text(),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    const data = await response.json();
    const result = NextResponse.json(data, {
      status: response.status,
      headers: { 'Cache-Control': 'no-store' },
    });
    if (response.ok && data.token)
      result.cookies.set('abo_admin_token', data.token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 86400,
      });
    return result;
  } catch {
    return NextResponse.json({ error: 'Login unavailable' }, { status: 503 });
  }
}
