import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { ShippingMethod } from '../models/ShippingMethod.js';
const invalid = (message) => Object.assign(new Error(message), { statusCode: 400 });
const minor = (value) => Math.round(value * 100);
const capacity = (product) => {
  if (product.storageCapacity > 0) return product.storageCapacity;
  const match = product.name.match(/(\d+(?:\.\d+)?)\s*(TB|GB)/i);
  return match ? Number(match[1]) * (match[2].toUpperCase() === 'TB' ? 1000 : 1) : 0;
};
export async function checkoutQuote(body, session) {
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 100)
    throw invalid('السلة غير صالحة.');
  const quantities = new Map();
  for (const item of body.items) {
    const id = item.productId || item.id;
    if (
      !mongoose.isValidObjectId(id) ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99
    )
      throw invalid('كمية المنتج غير صالحة.');
    if (quantities.has(id)) throw invalid('المنتج مكرر في السلة.');
    quantities.set(id, item.quantity);
  }
  const products = await Product.find({ _id: { $in: [...quantities.keys()] } })
    .session(session)
    .lean();
  if (products.length !== quantities.size) throw invalid('أحد المنتجات لم يعد متاحاً.');
  let capacityGB = 0;
  for (const p of products)
    if (p.type === 'storage') capacityGB += capacity(p) * quantities.get(String(p._id));
  let freeGB = capacityGB;
  const driveInput = body.driveItems || [];
  if (!Array.isArray(driveInput) || driveInput.length > 100)
    throw invalid('قائمة الداتا غير صالحة.');
  const driveIds = driveInput.map((item) => item.productId || item.id);
  if (
    driveIds.some((id) => !mongoose.isValidObjectId(id)) ||
    new Set(driveIds).size !== driveIds.length
  )
    throw invalid('قائمة الداتا غير صالحة.');
  const driveProducts = await Product.find({
    _id: { $in: driveIds },
    type: { $in: ['data', 'games'] },
  })
    .session(session)
    .lean();
  if (driveProducts.length !== driveIds.length) throw invalid('أحد ملفات الداتا لم يعد متاحاً.');
  const driveItems = driveProducts.map((p) => {
    const quantity =
      driveInput.find((item) => (item.productId || item.id) === String(p._id)).quantity || 1;
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99)
      throw invalid('كمية الداتا غير صالحة.');
    return { name: p.name, sizeGB: (p.gbSize || 0) * quantity, category: p.subtype || p.type };
  });
  const driveGB = driveItems.reduce((sum, item) => sum + item.sizeGB, 0);
  if (driveGB > capacityGB) throw invalid('حجم الداتا يتجاوز مساحة التخزين المتاحة.');
  let totalGB = 0;
  let subtotalMinor = 0;
  const items = products.map((p) => {
    const quantity = quantities.get(String(p._id));
    if (!['data', 'games'].includes(p.type) && p.stockCount < quantity)
      throw Object.assign(new Error('الكمية المطلوبة غير متاحة حالياً.'), { statusCode: 409 });
    const selectedBrand = body.items.find(
      (item) => (item.productId || item.id) === String(p._id)
    ).selectedBrand;
    if (p.isBrandActive && p.brands?.length && !p.brands.includes(selectedBrand))
      throw invalid('يرجى اختيار علامة تجارية متاحة للمنتج.');
    let lineMinor = minor(p.price) * quantity;
    if (p.type === 'data') {
      const size = (p.gbSize || 0) * quantity;
      totalGB += size;
      const free = Math.min(size, freeGB);
      freeGB -= free;
      lineMinor = minor((size - free) * 0.5);
    }
    if (!Number.isSafeInteger(lineMinor) || lineMinor < 0) throw invalid('سعر المنتج غير صالح.');
    subtotalMinor += lineMinor;
    return {
      product: p._id,
      name: p.name,
      price: lineMinor / quantity / 100,
      quantity,
      selectedBrand: p.brands?.includes(selectedBrand) ? selectedBrand : undefined,
    };
  });
  let shippingMinor = 0;
  let depositMinor = 0;
  if (body.deliveryMethod !== 'pickup') {
    const method = await ShippingMethod.findOne({
      name: body.selectedShippingMethod,
      isActive: true,
    })
      .session(session)
      .lean();
    const gov = method?.governorates.find((g) => g.name === body.governorate);
    if (!gov) throw invalid('يرجى اختيار طريقة الشحن والمحافظة.');
    shippingMinor = minor(gov.cost);
    depositMinor = shippingMinor;
  }
  const orderTotalMinor = subtotalMinor + shippingMinor;
  if (!Number.isSafeInteger(orderTotalMinor) || orderTotalMinor < 0 || shippingMinor < 0)
    throw invalid('الإجمالي غير صالح.');
  return {
    items,
    products,
    driveItems,
    capacityGB,
    totalGB,
    orderTotalMinor,
    shippingMinor,
    depositMinor: Math.min(depositMinor, orderTotalMinor),
  };
}
