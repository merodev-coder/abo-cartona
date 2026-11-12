import test from 'node:test';
import assert from 'node:assert/strict';
import { Category } from '../models/Category.js';
import { Brand } from '../models/Brand.js';
import { updateCategory } from '../controllers/categoryController.js';
import { updateBrand } from '../controllers/brandController.js';
test('patching a category label preserves omitted subcategories', async (t) => {
  let update;
  t.mock.method(Category, 'findByIdAndUpdate', async (_id, body) => {
    update = body;
    return { _id: 'qa', subCategories: [], ...body };
  });
  await updateCategory(
    { params: { id: 'qa' }, body: { label: 'Updated' } },
    { json() {} },
    (error) => {
      throw error;
    }
  );
  assert.equal(update.label, 'Updated');
  assert.equal(Object.hasOwn(update, 'subCategories'), false);
});
test('patching a brand name does not reactivate a disabled brand', async (t) => {
  let update;
  t.mock.method(Brand, 'findByIdAndUpdate', async (_id, body) => {
    update = body;
    return { _id: 'qa', ...body };
  });
  await updateBrand({ params: { id: 'qa' }, body: { name: 'Updated' } }, { json() {} }, (error) => {
    throw error;
  });
  assert.equal(update.name, 'Updated');
  assert.equal(Object.hasOwn(update, 'isActive'), false);
});
