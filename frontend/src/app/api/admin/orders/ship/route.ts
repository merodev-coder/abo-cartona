import { NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import { connectDB } from '@/lib/db';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await Order.findOne({
      $or: [{ orderID: orderId }, { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }],
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'shipped' || order.status === 'completed') {
      return NextResponse.json({ error: 'Order is already processed' }, { status: 400 });
    }

    const bostaApiUrl = process.env.BOSTA_API_URL || 'https://stg-app.bosta.co/api/v2';
    const bostaApiKey = process.env.BOSTA_API_KEY;
    const pickupAddressId = process.env.BOSTA_PICKUP_ADDRESS_ID;

    if (!bostaApiKey) {
      return NextResponse.json(
        { error: 'Server BOSTA_API_KEY configuration missing' },
        { status: 500 }
      );
    }

    if (!pickupAddressId) {
      return NextResponse.json(
        { error: 'Please add your Bosta Pickup Address ID (BOSTA_PICKUP_ADDRESS_ID) to .env' },
        { status: 500 }
      );
    }

    // Sanitize Arabic and English Names safely without erasing Arabic names like "محمد"
    const rawName = order.customerName || 'Customer';
    const cleanName = rawName.replace(/[^a-zA-Z\u0600-\u06FF ]/g, '').trim() || 'Client';

    // Validate and clean Phone strictly
    let cleanPhone = order.phone || '';
    cleanPhone = cleanPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone.startsWith('01')) {
      return NextResponse.json(
        { error: `Phone number must start with 01. Retrieved: ${order.phone}` },
        { status: 400 }
      );
    }
    if (cleanPhone.length !== 11) {
      return NextResponse.json(
        { error: `Phone number is not valid: ${cleanPhone}` },
        { status: 400 }
      );
    }

    const itemsCount = (order.items?.length || 0) + (order.driveItems?.length || 0);

    const bostaPayload = {
      type: 10,
      pickupAddressId: pickupAddressId,
      specs: {
        packageDetails: {
          itemsCount: itemsCount > 0 ? itemsCount : 1,
        },
      },
      receiver: {
        firstName: cleanName,
        phone: cleanPhone,
      },
      dropOffAddress: {
        city: order.cityCode || 'EG-01',
        firstLine: order.address || 'Address Not Provided',
        buildingNumber: '1',
        floor: '1',
        apartment: '1',
      },
    };

    const bostaRes = await fetch(`${bostaApiUrl}/deliveries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: bostaApiKey,
      },
      body: JSON.stringify(bostaPayload),
    });

    if (!bostaRes.ok) {
      const errorData = await bostaRes.json();
      console.error('Bosta API Error Detail:', JSON.stringify(errorData, null, 2));
      return NextResponse.json(
        { error: 'Failed to create Bosta delivery', details: errorData },
        { status: bostaRes.status }
      );
    }

    const bostaData = await bostaRes.json();

    // Typically Bosta returns `_id` and `trackingNumber`
    const deliveryId = bostaData.message?._id || bostaData._id;
    const trackingNumber = bostaData.message?.trackingNumber || bostaData.trackingNumber;

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Bosta did not return a tracking number', details: bostaData },
        { status: 500 }
      );
    }

    // Update MongoDB status and identifiers
    order.trackingNumber = trackingNumber;
    order.deliveryId = deliveryId;
    order.status = 'shipped';
    await order.save();

    return NextResponse.json({
      success: true,
      trackingNumber,
      deliveryId,
      message: 'Order shipped with Bosta successfully',
    });
  } catch (error: any) {
    console.error('Shipment error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
