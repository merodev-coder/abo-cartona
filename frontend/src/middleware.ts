import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  // The login handlers delegate to the rate-limited backend.
  if (path === '/api/admin/login') return NextResponse.next();
  const token =
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    req.cookies.get('abo_admin_token')?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    });
    if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // Cookie-authorized mutations require a matching origin. Bearer requests
    // are explicitly authorized and never derive authority from cookies.
    if (
      !req.headers.get('authorization') &&
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      req.headers.get('origin') !== req.nextUrl.origin
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.next();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
export const config = { matcher: ['/api/admin/:path*'] };
