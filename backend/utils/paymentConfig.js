// Public receiving details supplied by the store owner; never a payment credential.
const storePhone = '+20 106 795 7449';

export function paymentMethods() {
  return [
    {
      id: 'vodafone',
      code: 'VODAFONE_CASH',
      name: 'فودافون كاش',
      destination: process.env.PAYMENT_VODAFONE_DESTINATION?.trim() || storePhone,
      enabled: process.env.PAYMENT_VODAFONE_ENABLED !== 'false',
    },
    {
      id: 'instapay',
      code: 'INSTAPAY',
      name: 'إنستاباي',
      destination: process.env.PAYMENT_INSTAPAY_DESTINATION?.trim() || storePhone,
      // The owner explicitly confirmed this phone receives InstaPay transfers.
      // An explicit false setting can still disable the method operationally.
      enabled: process.env.PAYMENT_INSTAPAY_CONFIRMED !== 'false',
    },
  ]
    .map((method) => ({ ...method, destination: method.destination.trim() }))
    .filter(
      (method) =>
        method.enabled &&
        method.destination &&
        method.destination.length <= 254 &&
        !/[\x00-\x1f\x7f]/.test(method.destination)
    )
    .map(({ enabled: _enabled, ...method }) => method);
}

export function paymentForProof(proof) {
  const method = paymentMethods().find(
    (method) => method.id === proof.paymentMethod || method.code === proof.paymentMethod
  );
  if (!method || !proof.paymentDestination || method.destination !== proof.paymentDestination)
    throw Object.assign(new Error('تغيرت بيانات التحويل. يرجى مراجعتها ورفع إثبات جديد.'), {
      statusCode: 400,
    });
  return method;
}
