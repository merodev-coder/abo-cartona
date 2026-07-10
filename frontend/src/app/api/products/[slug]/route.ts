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
      ? doc.tags.map((t: any) => ({
          id: String(t._id || t),
          name: t.name || '',
          slug: t.slug || '',
        }))
      : [],
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : '',
  };
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  await connectDB();
  const { slug } = await ctx.params;

  const doc = await Product.findOne({ slug }).populate('tags').lean();
  if (!doc) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const product = mapProduct(doc);

  // Fetch related products from same category, excluding current
  const relatedDocs = await Product.find({
    type: (doc as any).type,
    _id: { $ne: (doc as any)._id },
  })
    .populate('tags')
    .limit(5)
    .sort({ createdAt: -1 })
    .lean();

  const related = relatedDocs.map((d: any) => mapProduct(d));

  return NextResponse.json({ product, related });
}
