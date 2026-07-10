import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';

function isAuthed(req: Request) {
  // Accept simple header auth (matches localStorage-based admin login)
  const adminKey = req.headers.get('x-admin-key');
  const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
  if (adminKey && adminUsername && adminKey === adminUsername) return true;

  // Legacy JWT cookie auth
  const cookie = req.headers.get('cookie') || '';
  const matchSession = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/);
  const matchToken = cookie.match(/(?:^|;\s*)abo_admin_token=([^;]+)/);
  const token = matchSession
    ? decodeURIComponent(matchSession[1])
    : matchToken
      ? decodeURIComponent(matchToken[1])
      : '';
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return false;
  try {
    jwt.verify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await ctx.params;

  let order;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    order = await Order.findOne({ $or: [{ _id: id }, { orderID: id }] }).lean();
  } else {
    order = await Order.findOne({ orderID: id }).lean();
  }
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    order: {
      id: String((order as any)._id),
      orderID: (order as any).orderID,
      customerName: (order as any).customerName,
      phone: (order as any).phone,
      address: (order as any).address,
      items: (order as any).items || [],
      driveItems: (order as any).driveItems || [],
      totalPrice: (order as any).totalPrice || 0,
      capacityGB: (order as any).capacityGB || 0,
      uploadedPhotoUrl: (order as any).uploadedPhotoUrl || (order as any).paymentScreenshot,
      status: (order as any).status || 'pending',
      trackingNumber: (order as any).trackingNumber || null,
      storageDataMapping: (order as any).storageDataMapping || [],
      createdAt: (order as any).createdAt ? new Date((order as any).createdAt).toISOString() : '',
      updatedAt: (order as any).updatedAt ? new Date((order as any).updatedAt).toISOString() : '',
    },
  });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as { status?: string };

  const updated = await Order.findByIdAndUpdate(
    id,
    { status: body?.status || 'pending' },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, order: updated });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await ctx.params;

  let deleted;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    deleted = await Order.findOneAndDelete({ $or: [{ _id: id }, { orderID: id }] });
  } else {
    deleted = await Order.findOneAndDelete({ orderID: id });
  }
  if (!deleted) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
