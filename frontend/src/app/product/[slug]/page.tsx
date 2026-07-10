import React from 'react';
import { connectDB } from '@/lib/db';
import { Product as ProductModel } from '@/models/Product';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductPage from './ProductPage';
import { Product } from '@/store/useStore';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB();

  const { slug } = await params;

  // Fallback support for older documents lacking slug generations
  const doc = (await ProductModel.findOne({
    $or: [{ slug }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
  }).lean()) as any;

  if (!doc) {
    return (
      <div className="min-h-screen bg-surface bg-surface flex flex-col" dir="rtl">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-surface-tertiary bg-surface-tertiary flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-text-muted"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
            </div>
            <h1 className="text-h2 font-heading text-text-primary text-text-primary mb-2">
              المنتج غير موجود
            </h1>
            <p className="text-body-sm text-text-muted text-text-muted mb-6">
              لم يتم العثور على هذا المنتج: {slug}
            </p>
            <a href="/products" className="btn-primary inline-flex items-center gap-2 text-body-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
              <span>العودة للمتجر</span>
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Sanitize the product object for Client Props mapping
  const product: Product = {
    ...doc,
    _id: doc._id.toString(),
    id: doc._id.toString(),
    isBrandActive: doc.isBrandActive || false,
    brands: Array.isArray(doc.brands) ? doc.brands : [],
    stockCount: doc.stockCount || 0,
    storageCapacity: doc.storageCapacity || null,
    gbSize: doc.gbSize || null,
    createdAt: doc.createdAt?.toString() || '',
    updatedAt: doc.updatedAt?.toString() || '',
  };

  // Fetch products for recommendation engine
  // Priority: Same category > Same brand > Price similarity
  const categoryProductsDocs = (await ProductModel.find({
    type: product.type,
    _id: { $ne: doc._id },
  })
    .limit(20)
    .lean()) as any[];

  const categoryProducts: Product[] = categoryProductsDocs.map((p) => ({
    ...p,
    _id: p._id.toString(),
    id: p._id.toString(),
    isBrandActive: p.isBrandActive || false,
    brands: Array.isArray(p.brands) ? p.brands : [],
    stockCount: p.stockCount || 0,
    storageCapacity: p.storageCapacity || null,
    gbSize: p.gbSize || null,
    createdAt: p.createdAt?.toString() || '',
    updatedAt: p.updatedAt?.toString() || '',
  }));

  const categoryLabel =
    product.type === 'laptops'
      ? ' اللابتوبات'
      : product.type === 'accessories'
        ? 'إكسسوارات'
        : product.type === 'storage'
          ? 'قطع كمبيوتر'
          : 'داتا';

  return (
    <div className="min-h-screen bg-surface bg-surface" dir="rtl">
      <Header />
      <ProductPage
        product={product}
        relatedProducts={categoryProducts}
        categoryLabel={categoryLabel}
      />
      <Footer />
    </div>
  );
}
