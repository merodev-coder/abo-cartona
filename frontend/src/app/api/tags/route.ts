import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tag } from '@/models/Tag';

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  await connectDB();
  const tags = await Tag.find({}).sort({ name: 1 }).lean();
  return NextResponse.json({
    tags: tags.map((t: any) => ({ id: String(t._id), name: t.name, slug: t.slug })),
  });
}

export async function POST(req: Request) {
  await connectDB();
  const body = (await req.json().catch(() => null)) as { name?: string } | null;
  const name = (body?.name || '').trim();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  const slug = slugify(name);
  const created = await Tag.create({ name, slug });
  return NextResponse.json({
    tag: { id: String(created._id), name: created.name, slug: created.slug },
  });
}
