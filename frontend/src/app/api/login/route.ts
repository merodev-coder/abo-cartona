export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    username?: string;
    password?: string;
  } | null;

  const username = body?.username || '';
  const password = body?.password || '';

  const expectedUser = process.env.ADMIN_USERNAME || 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD || 'admin';

  if (username !== expectedUser || password !== expectedPass) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const secret = process.env.JWT_SECRET || 'fallback_secret';

  const token = jwt.sign({ username: 'admin', role: 'admin' }, secret, { expiresIn: '7d' });

  const res = NextResponse.json({ token, success: true });
  // Set the precise 'admin_session' cookie requested
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
