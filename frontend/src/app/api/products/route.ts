import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';

function mapProduct(doc: any) {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug || '',
    type: doc.type,
    subtype: doc.subtype || '',
    price: doc.price || 0,
    oldPrice: doc.oldPrice,
    description: doc.description,
    images: Array.isArray(doc.images) ? doc.images : [],
    specs: doc.specs || null,
    stockCount: doc.stockCount || 0,
    storageCapacity: typeof doc.storageCapacity === 'number' ? doc.storageCapacity : 0,
    gbSize: typeof doc.gbSize === 'number' ? doc.gbSize : 0,
    isSale: !!doc.isSale,
    isBrandActive: !!doc.isBrandActive,
    brands: Array.isArray(doc.brands) ? doc.brands : [],
    tags: Array.isArray(doc.tags)
      ? doc.tags.map((t: string) => ({
          id: t,
          name: t,
          slug: t.toLowerCase().replace(/\s+/g, '-'),
        }))
      : [],
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : '',
  };
}

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search') || '';
  const isSale = searchParams.get('isSale');
  const tags = searchParams.get('tags');

  const filter: Record<string, unknown> = {};

  if (category) filter.type = category;
  if (typeof isSale === 'string') filter.isSale = isSale === 'true';
  if (tags) {
    const ids = tags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length) filter.tags = { $in: ids };
  }

  if (search.trim()) {
    const q = search.trim();
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { name: regex },
      { subtype: regex },
      { brand: regex },
      { description: regex },
      { specs: regex },
    ];
  }

  const docs = await Product.find(filter).sort({ createdAt: -1 }).lean();

  const products = docs.map((doc: any) => mapProduct(doc));

  return NextResponse.json({ products });
}
