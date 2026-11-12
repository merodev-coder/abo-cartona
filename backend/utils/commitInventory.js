import { Product } from '../models/Product.js';
export async function commitInventory(items, session) {
  for (const item of items) {
    const result = await Product.updateOne(
      { _id: item.product, type: { $nin: ['data', 'games'] }, stockCount: { $gte: item.quantity } },
      { $inc: { stockCount: -item.quantity } },
      { session }
    );
    if (!result.modifiedCount) {
      const virtual = await Product.exists({
        _id: item.product,
        type: { $in: ['data', 'games'] },
      }).session(session);
      if (!virtual)
        throw Object.assign(new Error('الكمية المطلوبة لم تعد متاحة. يرجى تحديث السلة.'), {
          statusCode: 409,
        });
    }
  }
}
