import { NextResponse } from 'next/server';
import { isAdmin as isAuthed } from '@/lib/adminAuth';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();

  // Get all unique tags from products
  const products = await Product.find({}, { tags: 1 }).lean();
  const allTags = products.flatMap((p) => p.tags || []);
  const uniqueTags = Array.from(new Set(allTags));

  const tags = uniqueTags.map((tag) => ({
    id: tag,
    name: tag,
    slug: slugify(tag),
  }));

  return NextResponse.json({ tags });
}

export async function POST(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = (await req.json().catch(() => null)) as { name?: string } | null;
  const name = (body?.name || '').trim();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const slug = slugify(name);
  const tag = { id: name, name, slug };

  return NextResponse.json({ tag });
}
