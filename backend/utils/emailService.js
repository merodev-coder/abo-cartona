import { Resend } from 'resend';

let resend = null;

function getResendInstance() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function sendOrderReceipt({ customerEmail, customerName, orderID, items, totalPrice, deliveryMethod, pickupLocation }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set — skipping receipt email.');
    return;
  }

  if (!customerEmail) {
    console.error('[Email] No customer email provided for order:', orderID);
    return;
  }


  // 3. فلترة العناصر (تجاهل الـ Data لو في منتجات تانية)
  const nonDataItems = items.filter((item) => item.type !== 'data');
  const displayItems = nonDataItems.length > 0 ? nonDataItems : items;

  if (displayItems.length === 0) return;

  const itemRows = displayItems
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid #1a2a3a;">
          <td style="padding: 12px 16px; color: #e2e8f0; font-size: 14px;">${item.name}</td>
          <td style="padding: 12px 16px; color: #94a3b8; font-size: 14px; text-align: center;">${item.quantity || 1}</td>
          <td style="padding: 12px 16px; color: #00d4aa; font-size: 14px; text-align: left; font-weight: bold;">${((item.price || 0) * (item.quantity || 1)).toLocaleString('ar-EG')} جنيه</td>
        </tr>`
    )
    .join('');

  // Generate pickup information section if applicable
  const pickupSection = deliveryMethod === 'pickup' && pickupLocation ? `
    <div style="background-color: #0a1628; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #1a3a5c;">
      <h4 style="color: #00d4aa; font-size: 16px; margin: 0 0 12px; display: flex; align-items: center; gap: 8px;">
        📍 معلومات الاستلام من المحل
      </h4>
      <div style="space-y: 8px;">
        <p style="margin: 0; color: #e2e8f0; font-size: 14px;"><strong>${pickupLocation.storeName}</strong></p>
        <p style="margin: 4px 0; color: #94a3b8; font-size: 13px;">${pickupLocation.address}</p>
        <p style="margin: 4px 0; color: #94a3b8; font-size: 13px;">🕒 ${pickupLocation.workingHours}</p>
        <p style="margin: 4px 0; color: #94a3b8; font-size: 13px;">📞 ${pickupLocation.phone}</p>
        <div style="margin-top: 12px; padding: 12px; background-color: #00d4aa15; border: 1px solid #00d4aa40; border-radius: 8px;">
          <p style="margin: 0; color: #00d4aa; font-size: 12px; font-weight: bold;">
            ✅ بدون رسوم شحن • ✅ بدون عربون • ✅ الدفع عند الاستلام
          </p>
        </div>
        <a href="https://maps.google.com/?q=${pickupLocation.coordinates.lat},${pickupLocation.coordinates.lng}" 
           style="display: inline-block; margin-top: 12px; padding: 8px 16px; background-color: #00d4aa; color: #0a1628; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: bold;">
          🗺️ افتح في جوجل ماب
        </a>
      </div>
    </div>
  ` : '';

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>إيصال طلبك</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a1628; font-family: 'Segoe UI', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0f1f35; border-radius: 16px; overflow: hidden; border: 1px solid #1a2a3a;">

    <div style="background: linear-gradient(135deg, #00d4aa 0%, #0099ff 100%); padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; color: #0a1628; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">أبوكرتونة</h1>
      <p style="margin: 8px 0 0; color: #0a1628; font-size: 14px; opacity: 0.8;">Gaming Store</p>
    </div>

    <div style="padding: 32px 24px;">
      <p style="color: #94a3b8; font-size: 16px; margin: 0 0 8px;">مرحباً، <strong style="color: #e2e8f0;">${customerName}</strong> 👋</p>
      <p style="color: #94a3b8; font-size: 15px; margin: 0 0 24px;">تم استلام طلبك بنجاح! فيما يلي تفاصيل الإيصال.</p>

      <div style="background-color: #0a1628; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; border: 1px solid #1a3a5c;">
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">رقم الطلب</p>
        <p style="margin: 4px 0 0; color: #00d4aa; font-size: 20px; font-weight: 900; letter-spacing: 1px;">${orderID}</p>
      </div>

      ${pickupSection}

      <h3 style="color: #e2e8f0; font-size: 16px; margin: 0 0 12px;">المنتجات المطلوبة</h3>
      <table style="width: 100%; border-collapse: collapse; background-color: #0a1628; border-radius: 12px; overflow: hidden; border: 1px solid #1a2a3a;">
        <thead>
          <tr style="background-color: #1a2a3a;">
            <th style="padding: 12px 16px; color: #94a3b8; font-size: 13px; text-align: right; font-weight: 600;">المنتج</th>
            <th style="padding: 12px 16px; color: #94a3b8; font-size: 13px; text-align: center; font-weight: 600;">الكمية</th>
            <th style="padding: 12px 16px; color: #94a3b8; font-size: 13px; text-align: left; font-weight: 600;">السعر</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div style="background: linear-gradient(135deg, #00d4aa15 0%, #0099ff15 100%); border: 1px solid #00d4aa40; border-radius: 12px; padding: 16px 20px; margin-top: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #94a3b8; font-size: 15px; padding: 0;">الإجمالي النهائي</td>
            <td style="color: #00d4aa; font-size: 22px; font-weight: 900; text-align: left; padding: 0;">${(totalPrice || 0).toLocaleString('ar-EG')} جنيه</td>
          </tr>
        </table>
      </div>

      <p style="color: #64748b; font-size: 13px; margin: 24px 0 0; text-align: center;">
        سيتواصل معك فريقنا لتأكيد الطلب قريباً.<br/>
        شكراً لثقتك في أبوكرتونة Gaming Store ❤️
      </p>
    </div>

    <div style="background-color: #0a1628; padding: 16px 24px; text-align: center; border-top: 1px solid #1a2a3a;">
      <p style="margin: 0; color: #475569; font-size: 12px;">© ${new Date().getFullYear()} أبوكرتونة Gaming Store — جميع الحقوق محفوظة</p>
    </div>
  </div>
</body>
</html>`;

  try {
    const resendClient = getResendInstance();
    if (!resendClient) {
      console.error('[Email] Failed to initialize Resend client');
      return;
    }

    const { error } = await resendClient.emails.send({
      from: 'onboarding@resend.dev',
      to: customerEmail,
      subject: `✅ إيصال طلبك ${orderID} — أبوكرتونة`,
      html: html
    });
    
    if (error) {
      console.error('[Email] Resend error:', error.message);
    } else {
      console.log(`[Email] Receipt sent to ${customerEmail} for order ${orderID}`);
    }
  } catch (mailErr) {
    console.error('[Email] Failed to send email:', mailErr.message);
  }
}