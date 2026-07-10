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

const MONTHS_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'إبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export async function GET(req: Request) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

  await connectDB();

  // Fetch all products for cost calculation
  const products = await Product.find({}).lean();
  const productMap = new Map(products.map((p) => [p.name, p]));

  // Generate monthly data for the year
  const months = [];
  const yearlyTotals = {
    revenue: 0,
    productCost: 0,
    operationalCost: 0,
    netProfit: 0,
    itemsSold: 0,
    itemsRestocked: 0,
    ordersCount: 0,
  };

  for (let month = 1; month <= 12; month++) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch orders for this month
    const orders = await Order.find({
      status: { $in: ['completed', 'shipped'] },
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

    let monthRevenue = 0;
    let monthProductCost = 0;
    let monthItemsSold = 0;

    for (const order of orders) {
      const orderRevenue = order.subtotal || order.totalPrice || 0;
      monthRevenue += orderRevenue;

      for (const item of order.items || []) {
        const quantity = item.quantity || 1;
        monthItemsSold += quantity;

        const product = productMap.get(item.name);
        const productCost = product?.productCost || 0;
        monthProductCost += productCost * quantity;
      }
    }

    // Calculate operational costs (5% of revenue)
    const operationalCostRate = 0.05;
    const monthOperationalCost = Math.round(monthRevenue * operationalCostRate);

    // Calculate net profit
    const monthNetProfit = monthRevenue - monthProductCost - monthOperationalCost;

    // Estimate items restocked (placeholder - in real app would query stock movements)
    const monthItemsRestocked = 0;

    months.push({
      month,
      year,
      monthName: MONTHS_AR[month - 1],
      revenue: monthRevenue,
      productCost: monthProductCost,
      operationalCost: monthOperationalCost,
      netProfit: monthNetProfit,
      itemsSold: monthItemsSold,
      itemsRestocked: monthItemsRestocked,
      ordersCount: orders.length,
    });

    // Add to yearly totals
    yearlyTotals.revenue += monthRevenue;
    yearlyTotals.productCost += monthProductCost;
    yearlyTotals.operationalCost += monthOperationalCost;
    yearlyTotals.netProfit += monthNetProfit;
    yearlyTotals.itemsSold += monthItemsSold;
    yearlyTotals.itemsRestocked += monthItemsRestocked;
    yearlyTotals.ordersCount += orders.length;
  }

  return NextResponse.json({
    year,
    months,
    yearlyTotals,
  });
}
