export function storeConfig() {
  const address = 'القاهرة - حدائق حلوان';
  return {
    name: process.env.STORE_NAME || 'أبو كرتونة',
    address,
    hours: process.env.STORE_PICKUP_HOURS || '',
    phone: process.env.STORE_CONTACT_PHONE || '',
  };
}
