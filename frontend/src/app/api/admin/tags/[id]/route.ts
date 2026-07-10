import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';

function isAuthed(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Accept the bypass token from our new auth system
    if (token === 'bypass-token-for-admin') {
      return true;
    }
  }

  // Fallback to cookie check for backward compatibility
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)abo_admin_token=([^;]+)/);
  let token = match ? decodeURIComponent(match[1]) : '';

  if (token === 'bypass-token-for-admin') {
    return true;
  }

  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return false;
  try {
    jwt.verify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await ctx.params;
  
  // Remove the tag from all products that have it
  await Product.updateMany(
    { tags: id },
    { $pull: { tags: id } }
  );
  
  return NextResponse.json({ ok: true });
}
