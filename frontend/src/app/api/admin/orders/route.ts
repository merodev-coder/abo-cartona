import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';

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
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    orders: orders.map((doc: any) => ({
      id: String(doc._id),
      orderID: doc.orderID,
      customerName: doc.customerName,
      phone: doc.phone,
      address: doc.address,
      items: doc.items || [],
      driveItems: doc.driveItems || [],
      totalPrice: doc.totalPrice || 0,
      capacityGB: doc.capacityGB || 0,
      uploadedPhotoUrl: doc.uploadedPhotoUrl || doc.paymentScreenshot,
      status: doc.status || 'pending',
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : '',
    })),
  });
}
