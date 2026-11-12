import test from 'node:test';
import assert from 'node:assert/strict';
import { Product } from '../models/Product.js';
import { ShippingMethod } from '../models/ShippingMethod.js';
import { checkoutQuote } from '../utils/checkoutQuote.js';
import { commitInventory } from '../utils/commitInventory.js';
const hardware = '507f1f77bcf86cd799439011';
const data = '507f1f77bcf86cd799439012';
const query = (value) => ({ session: () => ({ lean: async () => value }) });

test('authoritative quote ignores submitted prices, shipping and deposit', async (t) => {
  t.mock.method(Product, 'find', (filter) =>
    query(
      filter._id.$in.length
        ? [{ _id: hardware, name: 'SSD 1TB', type: 'storage', storageCapacity: 1000, price: 650 }]
        : []
    )
  );
  const quote = await checkoutQuote(
    {
      deliveryMethod: 'pickup',
      items: [{ id: hardware, quantity: 1, price: 1 }],
      shippingCost: -999,
      requiredDeposit: 0,
    },
    null
  );
  assert.equal(quote.orderTotalMinor, 65000);
  assert.equal(quote.items[0].price, 650);
  assert.equal(quote.shippingMinor, 0);
});
test('digital capacity discount matches existing 0.5 EGP per payable GB', async (t) => {
  t.mock.method(Product, 'find', (filter) =>
    query(
      filter._id.$in.length
        ? [
            { _id: hardware, name: 'SSD', type: 'storage', storageCapacity: 100, price: 650 },
            { _id: data, name: 'Data', type: 'data', gbSize: 200, price: 999 },
          ]
        : []
    )
  );
  const quote = await checkoutQuote(
    {
      deliveryMethod: 'pickup',
      items: [
        { id: hardware, quantity: 1 },
        { id: data, quantity: 1 },
      ],
    },
    null
  );
  assert.equal(quote.orderTotalMinor, 70000);
});
test('delivery deposit is only the configured fee even for legacy full-payment methods', async (t) => {
  t.mock.method(Product, 'find', (filter) =>
    query(
      filter._id.$in.length ? [{ _id: hardware, name: 'SSD', type: 'storage', price: 650 }] : []
    )
  );
  t.mock.method(ShippingMethod, 'findOne', () =>
    query({ depositType: 'total_amount', governorates: [{ name: 'القاهرة', cost: 80 }] })
  );
  const quote = await checkoutQuote(
    {
      deliveryMethod: 'delivery',
      selectedShippingMethod: 'configured',
      governorate: 'القاهرة',
      items: [{ id: hardware, quantity: 1 }],
      shippingCost: 0,
    },
    null
  );
  assert.equal(quote.shippingMinor, 8000);
  assert.equal(quote.depositMinor, 8000);
});
test('duplicate IDs, fractional and negative quantities cannot bypass checkout', async () => {
  for (const items of [
    [{ id: hardware, quantity: -1 }],
    [{ id: hardware, quantity: 1.5 }],
    [
      { id: hardware, quantity: 1 },
      { id: hardware, quantity: 1 },
    ],
    [],
    [{ id: 'invalid', quantity: 1 }],
  ])
    await assert.rejects(checkoutQuote({ items }, null), { statusCode: 400 });
});
test('conditional stock write refuses insufficient stock', async (t) => {
  let condition;
  t.mock.method(Product, 'updateOne', async (filter) => {
    condition = filter;
    return { modifiedCount: 0 };
  });
  t.mock.method(Product, 'exists', () => ({ session: async () => null }));
  await assert.rejects(commitInventory([{ product: hardware, quantity: 3 }], null), {
    statusCode: 409,
  });
  assert.deepEqual(condition.stockCount, { $gte: 3 });
});
