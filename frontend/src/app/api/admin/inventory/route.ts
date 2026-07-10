import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';

function isAuthed(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)abo_admin_token=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : '';
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return false;
  try {
    jwt.verify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

  await connectDB();

  // Calculate date range for the selected month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // Fetch completed orders for the month
  const orders = await Order.find({
    status: { $in: ['completed', 'shipped'] },
    createdAt: { $gte: startDate, $lte: endDate },
  }).lean();

  // Fetch all products for stock info
  const products = await Product.find({}).lean();
  const productMap = new Map(products.map((p) => [p.name, p]));

  // Aggregate data by product
  const productStats = new Map();
  let totalRevenue = 0;
  let totalItems = 0;
  let totalProductCost = 0;

  for (const order of orders) {
    // Calculate revenue excluding shipping (use subtotal if available, otherwise totalPrice)
    const orderRevenue = order.subtotal || order.totalPrice || 0;
    totalRevenue += orderRevenue;

    for (const item of order.items || []) {
      const quantity = item.quantity || 1;
      totalItems += quantity;

      // Get product cost from the product model
      const product = productMap.get(item.name);
      const productCost = product?.productCost || 0;
      const itemCost = productCost * quantity;
      totalProductCost += itemCost;

      const existing = productStats.get(item.name) || {
        name: item.name,
        quantity: 0,
        revenue: 0,
        productCost: 0,
        profit: 0,
        category: 'unknown',
        image: null,
        stockCount: 0,
      };

      existing.quantity += quantity;
      existing.revenue += (item.price || 0) * quantity;
      existing.productCost += itemCost;
      existing.profit = existing.revenue - existing.productCost;

      // Link to product for category and stock info
      if (product) {
        existing.category = product.type || 'unknown';
        existing.image = product.images?.[0] || null;
        existing.stockCount = product.stockCount || 0;
        existing.productId = String(product._id);
      }

      productStats.set(item.name, existing);
    }
  }

  // Convert to array and sort by quantity sold (descending)
  const productPerformance = Array.from(productStats.values()).sort(
    (a, b) => b.quantity - a.quantity
  );

  // Find top seller for progress bars
  const maxQuantity = productPerformance[0]?.quantity || 1;

  // Calculate operational costs (default 5% of revenue - can be adjusted)
  const operationalCostRate = 0.05;
  const totalOperationalCost = Math.round(totalRevenue * operationalCostRate);

  // Calculate net profit: Revenue - Product Cost - Operational Costs
  const netProfit = totalRevenue - totalProductCost - totalOperationalCost;

  // Keep netProfitEstimate for backward compatibility
  const netProfitEstimate = netProfit;

  return NextResponse.json({
    summary: {
      totalRevenue,
      totalItems,
      totalProductCost,
      totalOperationalCost,
      netProfit,
      netProfitEstimate,
      orderCount: orders.length,
    },
    productPerformance: productPerformance.map((p) => ({
      ...p,
      salesProgress: Math.round((p.quantity / maxQuantity) * 100),
    })),
    month,
    year,
  });
}
