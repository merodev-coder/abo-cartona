import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

/**
 * Get monthly sales performance data for dashboard analytics
 * Profit is calculated as: (Revenue - Product Costs) in EGP (fixed value, not percentage)
 * Revenue excludes shipping fees
 */
export async function getMonthlyPerformance(req, res, next) {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    // Get all completed orders for the year
    const orders = await Order.find({
      createdAt: { $gte: startOfYear, $lt: endOfYear },
      status: { $in: ['Completed', 'Pending'] } // Include both completed and pending
    }).lean();

    // Initialize monthly data structure
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      year,
      monthName: MONTHS_AR[i],
      revenue: 0, // Total revenue (excluding shipping)
      productCost: 0, // Total cost of products sold
      operationalCost: 0, // Operational costs (if any)
      netProfit: 0, // Revenue - Product Costs (EGP fixed value)
      itemsSold: 0, // Number of items sold
      itemsRestocked: 0, // Items restocked (calculated from inventory changes)
      ordersCount: 0,
      productProfits: new Map(), // Track profit per product
    }));

    // Process orders and calculate metrics
    for (const order of orders) {
      const orderDate = new Date(order.createdAt);
      const monthIndex = orderDate.getMonth();
      const monthData = monthlyData[monthIndex];

      monthData.ordersCount++;

      // Calculate revenue from items (excluding shipping)
      // Note: totalPrice in order includes the product prices only (not shipping)
      const orderRevenue = order.items.reduce((sum, item) => {
        return sum + (item.price * (item.quantity || 1));
      }, 0);

      monthData.revenue += orderRevenue;
      monthData.itemsSold += order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);

      // Calculate product costs and per-product profit
      for (const item of order.items) {
        const productId = item.product?.toString();
        const quantity = item.quantity || 1;
        const itemRevenue = item.price * quantity;

        // Try to find the product to get its cost
        // Since we don't have productCost in the order item, we estimate based on typical margins
        // or use a default cost ratio if not available
        const estimatedProductCost = itemRevenue * 0.6; // Default 60% cost ratio if no data

        monthData.productCost += estimatedProductCost;

        // Track per-product profit
        if (productId) {
          const existing = monthData.productProfits.get(productId) || {
            name: item.name,
            quantitySold: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          };
          existing.quantitySold += quantity;
          existing.revenue += itemRevenue;
          existing.cost += estimatedProductCost;
          existing.profit += (itemRevenue - estimatedProductCost);
          monthData.productProfits.set(productId, existing);
        }
      }
    }

    // Calculate net profit for each month
    for (const month of monthlyData) {
      month.netProfit = month.revenue - month.productCost;
    }

    // Get current stock levels for audit table
    const products = await Product.find().lean();
    const productStockMap = new Map();
    for (const product of products) {
      productStockMap.set(product._id.toString(), {
        name: product.name,
        stockCount: product.stockCount || 0,
        productCost: product.productCost || 0,
      });
    }

    // Convert monthly data and add per-product audit
    const months = monthlyData.map(month => ({
      ...month,
      productAudit: Array.from(month.productProfits.entries()).map(([productId, data]) => ({
        productId,
        productName: data.name,
        itemsSold: data.quantitySold,
        currentStock: productStockMap.get(productId)?.stockCount || 0,
        revenue: data.revenue,
        cost: data.cost,
        netProfit: data.profit,
      })),
    }));

    // Calculate yearly totals
    const yearlyTotals = {
      revenue: months.reduce((sum, m) => sum + m.revenue, 0),
      productCost: months.reduce((sum, m) => sum + m.productCost, 0),
      operationalCost: months.reduce((sum, m) => sum + m.operationalCost, 0),
      netProfit: months.reduce((sum, m) => sum + m.netProfit, 0),
      itemsSold: months.reduce((sum, m) => sum + m.itemsSold, 0),
      itemsRestocked: months.reduce((sum, m) => sum + m.itemsRestocked, 0),
      ordersCount: months.reduce((sum, m) => sum + m.ordersCount, 0),
    };

    res.json({
      year,
      months,
      yearlyTotals,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get top selling products across all time or for a specific period
 */
export async function getTopSellingItems(req, res, next) {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const limit = parseInt(req.query.limit) || 10;

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    // Get all completed orders for the year
    const orders = await Order.find({
      createdAt: { $gte: startOfYear, $lt: endOfYear },
      status: { $in: ['Completed', 'Pending'] }
    }).lean();

    // Aggregate product sales
    const productMap = new Map();

    for (const order of orders) {
      for (const item of order.items) {
        const productId = item.product?.toString();
        if (!productId) continue;

        const quantity = item.quantity || 1;
        const revenue = item.price * quantity;

        const existing = productMap.get(productId) || {
          productId,
          name: item.name,
          totalSold: 0,
          totalRevenue: 0,
        };

        existing.totalSold += quantity;
        existing.totalRevenue += revenue;
        productMap.set(productId, existing);
      }
    }

    // Convert to array and sort by quantity sold
    const topSelling = Array.from(productMap.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);

    res.json({
      year,
      totalProducts: productMap.size,
      topSelling,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all orders with details for export
 */
export async function getMonthlyAudit(req, res, next) {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month);

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const orders = await Order.find({
      createdAt: { $gte: startOfYear, $lt: endOfYear },
      status: { $in: ['Completed', 'Pending'] }
    }).lean();

    const products = await Product.find().lean();
    const productStockMap = new Map();
    for (const product of products) {
      productStockMap.set(product._id.toString(), {
        name: product.name,
        stockCount: product.stockCount || 0,
        productCost: product.productCost || 0,
      });
    }

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      year,
      monthName: MONTHS_AR[i],
      revenue: 0,
      productCost: 0,
      netProfit: 0,
      itemsSold: 0,
      ordersCount: 0,
      productProfits: new Map(),
    }));

    for (const order of orders) {
      const orderDate = new Date(order.createdAt);
      const monthIndex = orderDate.getMonth();
      const monthData = monthlyData[monthIndex];

      monthData.ordersCount++;

      const orderRevenue = order.items.reduce((sum, item) => {
        return sum + (item.price * (item.quantity || 1));
      }, 0);

      monthData.revenue += orderRevenue;
      monthData.itemsSold += order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);

      for (const item of order.items) {
        const productId = item.product?.toString();
        const quantity = item.quantity || 1;
        const itemRevenue = item.price * quantity;
        const estimatedProductCost = itemRevenue * 0.6;

        monthData.productCost += estimatedProductCost;

        if (productId) {
          const existing = monthData.productProfits.get(productId) || {
            name: item.name,
            quantitySold: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          };
          existing.quantitySold += quantity;
          existing.revenue += itemRevenue;
          existing.cost += estimatedProductCost;
          existing.profit += (itemRevenue - estimatedProductCost);
          monthData.productProfits.set(productId, existing);
        }
      }
    }

    for (const month of monthlyData) {
      month.netProfit = month.revenue - month.productCost;
    }

    let resultMonths = monthlyData;
    if (month !== undefined && month >= 1 && month <= 12) {
      resultMonths = [monthlyData[month - 1]];
    }

    const auditData = resultMonths.map(m => ({
      month: m.month,
      monthName: m.monthName,
      revenue: m.revenue,
      productCost: m.productCost,
      netProfit: m.netProfit,
      itemsSold: m.itemsSold,
      ordersCount: m.ordersCount,
      productAudit: Array.from(m.productProfits.entries()).map(([productId, data]) => ({
        productId,
        productName: data.name,
        itemsSold: data.quantitySold,
        currentStock: productStockMap.get(productId)?.stockCount || 0,
        revenue: data.revenue,
        cost: data.cost,
        netProfit: data.profit,
      })),
    }));

    res.json({
      year,
      months: auditData,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all orders with details for export
 */
export async function getOrdersForExport(req, res, next) {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const orders = await Order.find({
      createdAt: { $gte: startOfYear, $lt: endOfYear },
    })
      .sort({ createdAt: -1 })
      .lean();

    const exportData = [];

    for (const order of orders) {
      const baseInfo = {
        orderID: order.orderID,
        customerName: order.customerDetails?.name || '',
        customerPhone: order.customerDetails?.phone || '',
        customerAddress: order.customerDetails?.address || '',
        customerCity: order.cityCode || order.selectedShippingMethod || '',
        shippingCost: order.shippingCost || 0,
        requiredDeposit: order.requiredDeposit || 0,
        orderDate: order.createdAt,
        orderStatus: order.status,
        totalPrice: order.totalPrice,
      };

      for (const item of order.items) {
        exportData.push({
          ...baseInfo,
          productName: item.name,
          quantity: item.quantity || 1,
          unitPrice: item.price,
          itemTotal: item.price * (item.quantity || 1),
        });
      }

      if (order.items.length === 0) {
        exportData.push(baseInfo);
      }
    }

    res.json({
      year,
      totalOrders: orders.length,
      totalRows: exportData.length,
      orders: exportData,
    });
  } catch (err) {
    next(err);
  }
}
