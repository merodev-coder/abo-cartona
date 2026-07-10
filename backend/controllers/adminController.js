import { Order } from '../models/Order.js';
import { createBostaTicket } from '../utils/bostaService.js';

/**
 * Create Bosta shipment for an existing order
 * This is used when admin manually triggers Bosta shipping
 */
export async function createBostaShipment(req, res, next) {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Find the order
    const order = await Order.findOne({ orderID: orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if already shipped with Bosta
    if (order.shippingProvider === 'Bosta' && order.trackingNumber) {
      return res.status(400).json({ error: 'Order already has Bosta tracking' });
    }

    // Get customer details
    const customerDetails = order.customerDetails || {};
    
    // Validate required fields
    if (!customerDetails.name || !customerDetails.phone || !customerDetails.address) {
      return res.status(400).json({ 
        error: 'Missing customer information',
        details: {
          name: !customerDetails.name ? 'Customer name is required' : null,
          phone: !customerDetails.phone ? 'Customer phone is required' : null,
          address: !customerDetails.address ? 'Customer address is required' : null
        }
      });
    }

    // Create Bosta ticket
    const bostaResult = await createBostaTicket({
      customerName: customerDetails.name,
      phone: customerDetails.phone,
      address: customerDetails.address,
      email: customerDetails.email,
      orderId: order.orderID
    });

    if (!bostaResult.success) {
      return res.status(500).json({ 
        error: 'Failed to create Bosta shipment',
        details: bostaResult.error
      });
    }

    // Update order with Bosta tracking information and status
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        trackingNumber: bostaResult.trackingNumber,
        deliveryId: bostaResult.deliveryId,
        shippingProvider: 'Bosta',
        status: 'جاري شحن الطلب'
      },
      { new: true }
    );

    console.log(`[Bosta] Manual shipment created for order ${orderId}: ${bostaResult.trackingNumber}`);

    res.json({
      success: true,
      trackingNumber: bostaResult.trackingNumber,
      trackingUrl: bostaResult.trackingUrl,
      order: updatedOrder
    });

  } catch (error) {
    console.error('[Admin] Failed to create Bosta shipment:', error);
    next(error);
  }
}
