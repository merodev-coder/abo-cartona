import { NextResponse } from 'next/server';
import { isAdmin as isAuthed } from '@/lib/adminAuth';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await ctx.params;

  // Remove the tag from all products that have it
  await Product.updateMany({ tags: id }, { $pull: { tags: id } });

  return NextResponse.json({ ok: true });
}
