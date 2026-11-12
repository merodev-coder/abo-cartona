export function storeConfig() {
  const address =
    process.env.STORE_PICKUP_ADDRESS || '9 شارع جمال، تقسيم فريد ذكي، حدائق المعصرة، القاهرة';
  return {
    name: process.env.STORE_NAME || 'أبو كرتونة',
    address,
    hours: process.env.STORE_PICKUP_HOURS || '',
    phone: process.env.STORE_CONTACT_PHONE || '',
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
  };
}
