import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import sharp from 'sharp';
import { UTApi } from 'uploadthing/server';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import orderRoutes from '../routes/orderRoutes.js';
import { errorHandler } from '../middleware/errorMiddleware.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { ShippingMethod } from '../models/ShippingMethod.js';

test('isolated replica-set checkout and payment lifecycle', { timeout: 600000 }, async (t) => {
  const database = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    binary: { version: '7.0.14' },
  });
  await mongoose.connect(database.getUri(), {
    dbName: 'checkout_isolated_test',
  });
  await Order.init();
  process.env.JWT_SECRET = 'isolated-integration-secret';
  process.env.UPLOADTHING_TOKEN = Buffer.from(
    JSON.stringify({
      apiKey: 'sk_isolated_test_key',
      appId: 'isolated',
      regions: ['iad1'],
    })
  ).toString('base64');
  process.env.PAYMENT_INSTAPAY_DESTINATION = 'isolated-fixture';
  let failUpload = false;
  t.mock.method(UTApi.prototype, 'uploadFiles', async (file, options) => {
    assert.equal(options.acl, 'private');
    assert.equal(file.type, 'image/webp');
    return failUpload
      ? { error: { message: 'Private ACL unavailable' }, data: null }
      : {
          error: null,
          data: { key: `fixture${crypto.randomBytes(8).toString('hex')}` },
        };
  });
  t.beforeEach(async () => {
    await mongoose.connection.collection('request_limits').deleteMany({});
  });
  const app = express();
  app.use(express.json());
  app.use('/api/orders', orderRoutes);
  app.use(errorHandler);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/orders`;
  const admin = jwt.sign({ role: 'admin', username: 'qa' }, process.env.JWT_SECRET);
  const owner = crypto.randomUUID();
  const image = await sharp({
    create: { width: 16, height: 16, channels: 3, background: '#37d7ac' },
  })
    .png()
    .toBuffer();
  const product = await Product.create({
    name: 'QA SSD',
    type: 'storage',
    price: 650,
    stockCount: 2,
    storageCapacity: 1000,
  });
  await ShippingMethod.create({
    name: 'QA delivery',
    governorates: [{ name: 'QA city', cost: 80 }],
    depositType: 'shipping_only',
  });
  const headers = {
    'Content-Type': 'application/json',
    'X-Checkout-Token': owner,
    'Idempotency-Key': crypto.randomUUID(),
  };
  async function proof(token = owner, bytes = image, checkout = {}, amountMinor = 10000) {
    const form = new FormData();
    form.append('paymentMethod', 'instapay');
    form.append(
      'checkout',
      JSON.stringify({
        deliveryMethod: 'pickup',
        items: [{ id: String(product._id), quantity: 1 }],
        ...checkout,
      })
    );
    form.append('depositAmountMinor', String(amountMinor));
    form.append('proof', new Blob([bytes], { type: 'image/png' }), 'receipt.png');
    return fetch(`${base}/proofs`, {
      method: 'POST',
      headers: { 'X-Checkout-Token': token },
      body: form,
    });
  }
  const body = (proofId, extra = {}) => ({
    deliveryMethod: 'pickup',
    customerName: 'QA Customer',
    phone: '01000000000',
    customerEmail: 'qa@example.invalid',
    items: [{ id: String(product._id), price: 650, quantity: 1 }],
    proofId,
    depositAmountMinor: 10000,
    ...extra,
  });
  const submit = (payload, custom = headers) =>
    fetch(base, {
      method: 'POST',
      headers: custom,
      body: JSON.stringify(payload),
    });
  const review = (id, status, reason) =>
    fetch(`${base}/${id}/deposit`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${admin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, reason }),
    });
  try {
    await t.test(
      'configuration distinguishes missing storage from missing payment destinations',
      async () => {
        const token = process.env.UPLOADTHING_TOKEN;
        delete process.env.UPLOADTHING_TOKEN;
        try {
          const config = await (await fetch(`${base}/payment-config`)).json();
          assert.equal(config.methods.length, 1);
          assert.deepEqual(config.configuration, {
            destinationReady: true,
            uploadReady: false,
          });
        process.env.UPLOADTHING_TOKEN = 'sk_invalid_raw_key';
        const invalid = await (await fetch(`${base}/payment-config`)).json();
        assert.equal(invalid.configuration.uploadReady, false);
        assert.equal(invalid.methods.length, 1);
      } finally {
        process.env.UPLOADTHING_TOKEN = token;
      }
      }
    );
    await t.test('administrative reads and proof access require authentication', async () => {
      assert.equal((await fetch(base)).status, 401);
      assert.equal((await fetch(`${base}/not-an-order/proof`)).status, 401);
    });
    await t.test('spoofed images and oversized uploads are rejected', async () => {
      assert.equal((await proof(owner, Buffer.from('<script>invalid image</script>'))).status, 400);
      assert.equal((await proof(owner, Buffer.alloc(5242881))).status, 413);
    });
    await t.test(
      'UploadThing private upload failures cannot produce accepted evidence',
      async () => {
        failUpload = true;
        assert.equal((await proof()).status, 503);
        assert.equal(await Order.countDocuments(), 0);
        failUpload = false;
      }
    );
    const upload = await proof();
    assert.equal(upload.status, 201);
    const { proofId } = await upload.json();
    await t.test('disabling the destination after upload blocks final payment claims', async () => {
      const destination = process.env.PAYMENT_INSTAPAY_DESTINATION;
      process.env.PAYMENT_INSTAPAY_DESTINATION = '   ';
      try {
        assert.equal((await submit(body(proofId))).status, 400);
        assert.equal(await Order.countDocuments(), 0);
      } finally {
        process.env.PAYMENT_INSTAPAY_DESTINATION = destination;
      }
    });
    await t.test('pickup submission without evidence is rejected', async () => {
      assert.equal((await submit(body(undefined))).status, 400);
    });
    await t.test(
      'the minimum and current catalog prices are enforced on direct API requests',
      async () => {
        const low = await Product.create({
          name: 'QA low value',
          type: 'accessories',
          price: 50,
          stockCount: 1,
        });
        assert.equal(
          (
            await submit(
              body(proofId, {
                items: [{ id: String(low._id), price: 50, quantity: 1 }],
              })
            )
          ).status,
          400
        );
        assert.equal(
          (
            await submit(
              body(proofId, {
                items: [{ id: String(product._id), price: 1, quantity: 1 }],
              })
            )
          ).status,
          409
        );
        assert.equal(await Order.countDocuments(), 0);
      }
    );
    const payload = body(proofId);
    const response = await submit(payload);
    assert.equal(response.status, 201, await response.clone().text());
    const { order } = await response.json();
    await t.test(
      'pickup is pending with 100 EGP deposit, 550 EGP balance and no locked stock',
      async () => {
        assert.equal(order.depositStatus, 'PENDING_VERIFICATION');
        assert.equal(order.depositAmountMinor, 10000);
        assert.equal(order.remainingBalanceMinor, 55000);
        assert.equal((await Product.findById(product._id)).stockCount, 2);
        const saved = await Order.findOne({ orderID: order.orderID }).select(
          '+depositProofFileKey +depositProofReference'
        );
        assert.equal(saved.depositType, 'STORE_PICKUP_DEPOSIT');
        assert.equal(saved.fulfillmentMethod, 'pickup');
        assert.equal(saved.deliveryFee, 0);
        assert.equal(saved.depositAmount, 100);
        assert.equal(saved.remainingBalance, 550);
        assert.equal(saved.pickupLocation.address, 'القاهرة - حدائق حلوان');
        assert.ok(saved.depositProofReference.startsWith('uploadthing:'));
        assert.ok(saved.depositProofFileKey);
      }
    );
    await t.test('idempotent retries return one order and consume proof once', async () => {
      const retry = await submit(payload);
      assert.equal(retry.status, 200);
      assert.equal((await retry.json()).order.orderID, order.orderID);
      assert.equal(await Order.countDocuments(), 1);
      assert.equal(
        (
          await submit(payload, {
            ...headers,
            'Idempotency-Key': crypto.randomUUID(),
          })
        ).status,
        400
      );
    });
    await t.test('other customers cannot read order status or claim evidence', async () => {
      assert.equal(
        (
          await fetch(`${base}/${order.orderID}/customer-status`, {
            headers: { 'X-Checkout-Token': crypto.randomUUID() },
          })
        ).status,
        404
      );
      const other = await proof(crypto.randomUUID());
      const id = (await other.json()).proofId;
      assert.equal(
        (
          await submit(body(id), {
            ...headers,
            'Idempotency-Key': crypto.randomUUID(),
          })
        ).status,
        400
      );
    });
    await t.test(
      'pickup proof cannot be reused for a delivery fee, and fee tampering fails at upload',
      async () => {
        const fresh = (await (await proof()).json()).proofId;
        const payload = body(fresh, {
          deliveryMethod: 'delivery',
          selectedShippingMethod: 'QA delivery',
          governorate: 'QA city',
          address: 'QA Address',
          depositAmountMinor: 8000,
        });
        assert.equal(
          (
            await submit(payload, {
              ...headers,
              'Idempotency-Key': crypto.randomUUID(),
            })
          ).status,
          400
        );
        assert.equal(
          (
            await proof(
              owner,
              image,
              {
                deliveryMethod: 'delivery',
                selectedShippingMethod: 'QA delivery',
                governorate: 'QA city',
              },
              10000
            )
          ).status,
          400
        );
      }
    );
    await t.test('a changed delivery fee invalidates already uploaded evidence', async () => {
      const id = (
        await (
          await proof(
            owner,
            image,
            {
              deliveryMethod: 'delivery',
              selectedShippingMethod: 'QA delivery',
              governorate: 'QA city',
            },
            8000
          )
        ).json()
      ).proofId;
      await ShippingMethod.updateOne(
        { name: 'QA delivery' },
        { $set: { 'governorates.0.cost': 70 } }
      );
      const result = await submit(
        body(id, {
          deliveryMethod: 'delivery',
          address: 'QA Address',
          selectedShippingMethod: 'QA delivery',
          governorate: 'QA city',
          depositAmountMinor: 7000,
        }),
        { ...headers, 'Idempotency-Key': crypto.randomUUID() }
      );
      assert.equal(result.status, 400);
      await ShippingMethod.updateOne(
        { name: 'QA delivery' },
        { $set: { 'governorates.0.cost': 80 } }
      );
    });
    await t.test('equal amounts cannot hide a different fulfillment type', async () => {
      await ShippingMethod.create({
        name: 'QA same amount',
        governorates: [{ name: 'QA city', cost: 100 }],
      });
      const id = (await (await proof()).json()).proofId;
      assert.equal(
        (
          await submit(
            body(id, {
              deliveryMethod: 'delivery',
              address: 'QA Address',
              selectedShippingMethod: 'QA same amount',
              governorate: 'QA city',
            }),
            { ...headers, 'Idempotency-Key': crypto.randomUUID() }
          )
        ).status,
        400
      );
    });
    await t.test(
      'approval allocates stock exactly once; fulfillment cannot bypass review',
      async () => {
        const before = await fetch(`${base}/${order.orderID}/status`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${admin}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'AwaitingPickup' }),
        });
        assert.equal(before.status, 409);
        assert.equal((await review(order.orderID, 'VERIFIED')).status, 200);
        assert.equal((await review(order.orderID, 'VERIFIED')).status, 409);
        assert.equal((await Product.findById(product._id)).stockCount, 1);
        const recorded = await Order.findOne({ orderID: order.orderID });
        assert.equal(recorded.depositVerifiedBy, 'qa');
        assert.ok(recorded.depositVerifiedAt);
        assert.equal(recorded.depositHistory.at(-1).status, 'VERIFIED');
      }
    );
    await t.test('proof links are owner/admin authorized and expire after 60 seconds', async () => {
      const own = await fetch(`${base}/${order.orderID}/customer-proof`, {
        headers: { 'X-Checkout-Token': owner },
      });
      assert.equal(own.status, 200);
      assert.equal(own.headers.get('cache-control'), 'no-store');
      const signed = new URL((await own.json()).url);
      assert.ok(signed.hostname.endsWith('ufs.sh'));
      const remaining = Number(signed.searchParams.get('expires')) - Date.now();
      assert.ok(remaining > 0 && remaining <= 61000);
      assert.ok(signed.searchParams.get('signature'));
      assert.equal(
        (
          await fetch(`${base}/${order.orderID}/customer-proof`, {
            headers: { 'X-Checkout-Token': crypto.randomUUID() },
          })
        ).status,
        404
      );
    });
    await t.test(
      'rejection requires a reason; replacement proof must be new and owned',
      async () => {
        const id = (await (await proof()).json()).proofId;
        const second = await submit(body(id), {
          ...headers,
          'Idempotency-Key': crypto.randomUUID(),
        });
        const secondOrder = (await second.json()).order;
        assert.equal((await review(secondOrder.orderID, 'REJECTED')).status, 400);
        assert.equal((await review(secondOrder.orderID, 'REJECTED', 'غير واضح')).status, 200);
        const reused = await fetch(`${base}/${secondOrder.orderID}/resubmit-proof`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ proofId: id }),
        });
        assert.equal(reused.status, 400);
        const fresh = (await (await proof()).json()).proofId;
        const replacement = await fetch(`${base}/${secondOrder.orderID}/resubmit-proof`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ proofId: fresh }),
        });
        assert.equal(replacement.status, 200);
      }
    );
    await t.test('concurrent approvals cannot oversell the last item', async () => {
      const candidates = [];
      for (let i = 0; i < 2; i++) {
        const id = (await (await proof()).json()).proofId;
        const created = await submit(body(id), {
          ...headers,
          'Idempotency-Key': crypto.randomUUID(),
        });
        candidates.push((await created.json()).order.orderID);
      }
      const results = await Promise.all(candidates.map((id) => review(id, 'VERIFIED')));
      assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
      assert.equal((await Product.findById(product._id)).stockCount, 0);
    });
    await t.test('delivery uses configured shipping and preserves its deposit policy', async () => {
      await Product.updateOne({ _id: product._id }, { $set: { stockCount: 1 } });
      const id = (
        await (
          await proof(
            owner,
            image,
            {
              deliveryMethod: 'delivery',
              selectedShippingMethod: 'QA delivery',
              governorate: 'QA city',
            },
            8000
          )
        ).json()
      ).proofId;
      const delivery = await submit(
        body(id, {
          deliveryMethod: 'delivery',
          address: 'QA Address',
          depositAmountMinor: 8000,
          governorate: 'QA city',
          selectedShippingMethod: 'QA delivery',
        }),
        { ...headers, 'Idempotency-Key': crypto.randomUUID() }
      );
      assert.equal(delivery.status, 201, await delivery.clone().text());
      const result = (await delivery.json()).order;
      assert.equal(result.totalPrice, 730);
      assert.equal(result.depositAmountMinor, 8000);
      assert.equal(result.remainingBalanceMinor, 65000);
      const cancelled = await fetch(`${base}/${result.orderID}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${admin}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Cancelled' }),
      });
      assert.equal(cancelled.status, 200);
      assert.equal((await Product.findById(product._id)).stockCount, 1);
      assert.equal(
        (
          await fetch(`${base}/${result.orderID}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${admin}` },
          })
        ).status,
        200
      );
      assert.equal((await Product.findById(product._id)).stockCount, 1);
    });
    await t.test(
      'zero-fee delivery requires neither proof nor a configured destination',
      async () => {
        await ShippingMethod.create({
          name: 'QA free',
          governorates: [{ name: 'QA city', cost: 0 }],
        });
        await Product.updateOne({ _id: product._id }, { $set: { stockCount: 1 } });
        const destination = process.env.PAYMENT_INSTAPAY_DESTINATION;
        delete process.env.PAYMENT_INSTAPAY_DESTINATION;
        try {
          const response = await submit(
            body(undefined, {
              deliveryMethod: 'delivery',
              address: 'QA Address',
              governorate: 'QA city',
              selectedShippingMethod: 'QA free',
              depositAmountMinor: 0,
            }),
            { ...headers, 'Idempotency-Key': crypto.randomUUID() }
          );
          assert.equal(response.status, 201, await response.clone().text());
          const result = (await response.json()).order;
          assert.equal(result.depositStatus, 'NOT_REQUIRED');
          assert.equal(result.depositAmountMinor, 0);
          assert.equal(result.remainingBalanceMinor, 65000);
        } finally {
          process.env.PAYMENT_INSTAPAY_DESTINATION = destination;
        }
      }
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    await database.stop();
  }
});
