import { pickupAmounts } from './depositPolicy.js';
export function depositRequirement(deliveryMethod, quote) {
  const amounts =
    deliveryMethod === 'pickup'
      ? pickupAmounts(quote.orderTotalMinor)
      : {
          orderTotalMinor: quote.orderTotalMinor,
          depositAmountMinor: quote.shippingMinor,
          remainingBalanceMinor: quote.orderTotalMinor - quote.shippingMinor,
        };
  return {
    ...amounts,
    depositType: deliveryMethod === 'pickup' ? 'STORE_PICKUP_DEPOSIT' : 'DELIVERY_FEE_DEPOSIT',
  };
}
export function validateProofRequirement(proof, requirement, fulfillmentMethod) {
  if (
    proof.provider !== 'uploadthing' ||
    proof.amountMinor !== requirement.depositAmountMinor ||
    proof.fulfillmentMethod !== fulfillmentMethod ||
    proof.depositType !== requirement.depositType
  ) {
    throw Object.assign(
      new Error('تغير نوع أو مبلغ العربون. يرجى رفع صورة تحويل جديدة بالمبلغ المطلوب.'),
      { statusCode: 400 }
    );
  }
}
