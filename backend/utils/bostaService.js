// Bosta API Service Integration
// Documentation: https://docs.bosta.co/

const BOSTA_API_BASE_URL = 'https://api.bosta.co/api/v2';
const BOSTA_API_KEY = process.env.BOSTA_API_KEY;

/**
 * Create a shipping ticket with Bosta
 * @param {Object} orderData - Order information
 * @param {string} orderData.customerName - Customer full name
 * @param {string} orderData.phone - Customer phone number
 * @param {string} orderData.address - Delivery address
 * @param {string} orderData.email - Customer email (optional)
 * @param {string} orderData.orderId - Order ID for reference
 * @returns {Promise<Object>} Bosta response with tracking details
 */
export async function createBostaTicket(orderData) {
  try {
    if (!BOSTA_API_KEY) {
      throw new Error('Bosta API key is not configured');
    }

    const { customerName, phone, address, email, orderId } = orderData;

    // Validate required fields
    if (!customerName || !phone || !address) {
      throw new Error('Missing required fields: customerName, phone, address');
    }

    // Prepare Bosta API request payload with proper data mapping
    const payload = {
      type: 'DELIVERY',
      dropOffAddress: {
        address: address,
        city: extractCityFromAddress(address) || 'Cairo',
        zone: extractZoneFromAddress(address) || 'Nasr City',
        coordinates: null
      },
      contactPerson: {
        name: customerName,
        phone: phone,
        email: email || null
      },
      notes: `Order ID: ${orderId}`,
      packageDetails: {
        size: 'MEDIUM',
        weight: 1,
        description: 'Electronics Package'
      },
      cashOnDelivery: {
        amount: 0,
        currency: 'EGP'
      }
    };

    console.log('[Bosta] Creating shipment with payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${BOSTA_API_BASE_URL}/deliveries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BOSTA_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Bosta] API Error Response:', errorData);
      throw new Error(`Bosta API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const bostaData = await response.json();
    console.log('[Bosta] API Success Response:', bostaData);

    return {
      success: true,
      trackingNumber: bostaData.trackingNumber,
      deliveryId: bostaData.id,
      trackingUrl: `https://track.bosta.co/${bostaData.trackingNumber}`,
      status: bostaData.status,
      data: bostaData
    };

  } catch (error) {
    console.error('[Bosta] Failed to create ticket:', error.message);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Extract city from address (simple implementation)
 * @param {string} address - Full address
 * @returns {string|null} City name or null
 */
function extractCityFromAddress(address) {
  if (!address) return null;
  
  const cities = ['القاهرة', 'Cairo', 'الجيزة', 'Giza', 'الإسكندرية', 'Alexandria', 'أسوان', 'Aswan'];
  const lowerAddress = address.toLowerCase();
  
  for (const city of cities) {
    if (lowerAddress.includes(city.toLowerCase())) {
      return city;
    }
  }
  
  return null;
}

/**
 * Extract zone from address (simple implementation)
 * @param {string} address - Full address
 * @returns {string|null} Zone name or null
 */
function extractZoneFromAddress(address) {
  if (!address) return null;
  
  const zones = ['نصر City', 'Nasr City', 'مصر الجديدة', 'New Cairo', 'المعادي', 'Maadi', 'الهرم', 'Giza', 'وسط البلد', 'Downtown'];
  const lowerAddress = address.toLowerCase();
  
  for (const zone of zones) {
    if (lowerAddress.includes(zone.toLowerCase())) {
      return zone;
    }
  }
  
  return null;
}

/**
 * Get tracking information for a Bosta delivery
 * @param {string} trackingNumber - Bosta tracking number
 * @returns {Promise<Object>} Tracking information
 */
export async function getBostaTracking(trackingNumber) {
  try {
    if (!BOSTA_API_KEY) {
      throw new Error('Bosta API key is not configured');
    }

    const response = await fetch(`${BOSTA_API_BASE_URL}/deliveries/${trackingNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BOSTA_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Bosta API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('[Bosta] Failed to get tracking:', error.message);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Check if shipping method is Bosta
 * @param {string} shippingMethod - Shipping method name
 * @returns {boolean} True if Bosta method
 */
export function isBostaMethod(shippingMethod) {
  if (!shippingMethod) return false;
  const bostaVariations = ['bosta', 'بوسطة', 'Bosta', 'BOSTA'];
  return bostaVariations.some(variation => 
    shippingMethod.toLowerCase().includes(variation.toLowerCase())
  );
}
