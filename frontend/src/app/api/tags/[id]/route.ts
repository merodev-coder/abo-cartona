import { isAdmin } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tag } from '@/models/Tag';

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdmin(_req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await ctx.params;
  await Tag.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
