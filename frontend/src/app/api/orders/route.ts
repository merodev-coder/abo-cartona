import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    const {
      orderID,
      customerName,
      phone,
      address,
      items,
      driveItems,
      totalPrice,
      capacityGB,
      uploadedPhotoUrl,
    } = data;

    if (!orderID || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const order = await Order.create({
      orderID,
      customerName,
      phone,
      address,
      items,
      driveItems: driveItems || [],
      totalPrice: Number(totalPrice) || 0,
      capacityGB: Number(capacityGB) || 0,
      uploadedPhotoUrl,
      status: 'pending',
    });

    // Reduce stock for each ordered item
    const stockUpdates = (items as any[]).map((item: any) => {
      const qty = item.quantity || 1;
      return Product.findByIdAndUpdate(
        item.id,
        { $inc: { stockCount: -qty } },
        { new: true }
      ).catch((err: any) => {
        console.error(`Failed to reduce stock for product ${item.id}:`, err);
      });
    });

    await Promise.allSettled(stockUpdates);

    return NextResponse.json({ ok: true, orderId: order.orderID, id: order._id });
  } catch (error: any) {
    console.error('Create Order Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}
