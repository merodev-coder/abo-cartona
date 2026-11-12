export const PICKUP_DEPOSIT_MINOR = 10000;
export function pickupAmounts(totalMinor) {
  if (!Number.isSafeInteger(totalMinor) || totalMinor < PICKUP_DEPOSIT_MINOR) {
    throw Object.assign(new Error('الحد الأدنى لطلب الاستلام من المحل 100 جنيه.'), {
      statusCode: 400,
    });
  }
  return {
    orderTotalMinor: totalMinor,
    depositAmountMinor: PICKUP_DEPOSIT_MINOR,
    remainingBalanceMinor: totalMinor - PICKUP_DEPOSIT_MINOR,
  };
}
export function validateDecision(current, next, reason) {
  if (current !== 'PENDING_VERIFICATION' || !['VERIFIED', 'REJECTED'].includes(next)) {
    throw Object.assign(new Error('تمت مراجعة التحويل بالفعل أو الحالة غير صالحة.'), {
      statusCode: 409,
    });
  }
  if (
    next === 'REJECTED' &&
    (typeof reason !== 'string' || !reason.trim() || reason.length > 500)
  ) {
    throw Object.assign(new Error('يرجى كتابة سبب الرفض (حتى 500 حرف).'), { statusCode: 400 });
  }
}
