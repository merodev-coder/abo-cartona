/**
 * Inventory Sync Test Suite
 * Tests for order deletion with inventory synchronization
 */

import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { restoreStockForOrder, decrementStockForOrder } from '../models/inventoryMiddleware.js';

/**
 * Test the complete order lifecycle with inventory sync
 */
export async function testInventorySync() {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('🧪 Starting Inventory Sync Test...');

    // 1. Create test products
    const testProducts = await Product.create([
      {
        name: 'Test Product 1',
        type: 'accessories',
        price: 100,
        stockCount: 10,
        isBrandActive: true,
        brands: ['Test Brand']
      },
      {
        name: 'Test Product 2',
        type: 'storage',
        price: 200,
        stockCount: 5,
        isBrandActive: true,
        brands: ['Test Brand']
      }
    ], { session });

    console.log(`✅ Created ${testProducts.length} test products`);

    // 2. Create an order with the test products
    const orderData = {
      orderID: 'TEST-001',
      customerDetails: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '01234567890',
        address: 'Test Address'
      },
      items: [
        {
          product: testProducts[0]._id,
          name: 'Test Product 1',
          price: 100,
          quantity: 2
        },
        {
          product: testProducts[1]._id,
          name: 'Test Product 2',
          price: 200,
          quantity: 1
        }
      ],
      totalPrice: 400,
      totalGB: 0,
      capacityGB: 0,
      status: 'Pending'
    };

    const order = await Order.create([orderData], { session });
    const createdOrder = order[0];

    console.log(`✅ Created order ${createdOrder.orderID}`);

    // 3. Manually decrement stock (simulating order creation)
    const decrementResult = await decrementStockForOrder(createdOrder, session);
    console.log(`✅ Decremented stock for ${decrementResult.decremented} products`);

    // 4. Check stock levels after decrement
    const productsAfterDecrement = await Product.find({ _id: { $in: testProducts.map(p => p._id) } }).session(session);
    console.log('📊 Stock levels after order creation:');
    productsAfterDecrement.forEach(product => {
      console.log(`   ${product.name}: ${product.stockCount} units`);
    });

    // 5. Delete the order and restore stock
    const stockRestoreResult = await restoreStockForOrder(createdOrder, session);
    console.log(`✅ Restored stock for ${stockRestoreResult.restored} products`);

    // 6. Delete the order
    await Order.findByIdAndDelete(createdOrder._id).session(session);
    console.log(`✅ Deleted order ${createdOrder.orderID}`);

    // 7. Check final stock levels
    const productsAfterRestore = await Product.find({ _id: { $in: testProducts.map(p => p._id) } }).session(session);
    console.log('📊 Final stock levels after order deletion:');
    productsAfterRestore.forEach(product => {
      console.log(`   ${product.name}: ${product.stockCount} units`);
    });

    // 8. Verify stock is restored to original levels
    const isStockRestored = productsAfterRestore.every((product, index) => 
      product.stockCount === testProducts[index].stockCount
    );

    if (isStockRestored) {
      console.log('🎉 SUCCESS: Stock levels properly restored!');
    } else {
      console.log('❌ FAILURE: Stock levels not properly restored');
    }

    await session.commitTransaction();
    session.endSession();

    return {
      success: isStockRestored,
      message: isStockRestored ? 'Inventory sync test passed' : 'Inventory sync test failed',
      details: {
        originalStock: testProducts.map(p => ({ name: p.name, stock: p.stockCount })),
        finalStock: productsAfterRestore.map(p => ({ name: p.name, stock: p.stockCount })),
        orderDeleted: createdOrder.orderID,
        itemsRestored: stockRestoreResult.restored
      }
    };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
}

/**
 * Test the controller deleteOrder function directly
 */
export async function testDeleteOrderController() {
  console.log('🧪 Testing deleteOrder controller...');

  try {
    // Create test data
    const testProduct = await Product.create({
      name: 'Controller Test Product',
      type: 'accessories',
      price: 150,
      stockCount: 8,
      isBrandActive: true,
      brands: ['Test Brand']
    });

    const testOrder = await Order.create({
      orderID: 'CTRL-TEST-001',
      customerDetails: {
        name: 'Controller Test Customer',
        email: 'controller@example.com',
        phone: '01234567890',
        address: 'Controller Test Address'
      },
      items: [
        {
          product: testProduct._id,
          name: 'Controller Test Product',
          price: 150,
          quantity: 3
        }
      ],
      totalPrice: 450,
      totalGB: 0,
      capacityGB: 0,
      status: 'Pending'
    });

    console.log(`✅ Created test order ${testOrder.orderID} with product stock: ${testProduct.stockCount}`);

    // Simulate the controller's deleteOrder function
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find the order
      const order = await Order.findById(testOrder._id).session(session);
      
      if (!order) {
        throw new Error('Order not found');
      }

      // Restore stock
      const stockRestoreResult = await restoreStockForOrder(order, session);

      // Delete the order
      await Order.findByIdAndDelete(order._id).session(session);

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Check final stock
      const finalProduct = await Product.findById(testProduct._id);
      
      const expectedStock = testProduct.stockCount + 3; // Original stock + restored quantity
      const success = finalProduct.stockCount === expectedStock;

      console.log(`📊 Expected stock: ${expectedStock}, Actual stock: ${finalProduct.stockCount}`);
      console.log(success ? '🎉 Controller test PASSED' : '❌ Controller test FAILED');

      // Cleanup
      await Product.findByIdAndDelete(testProduct._id);

      return {
        success,
        message: success ? 'Controller deleteOrder test passed' : 'Controller deleteOrder test failed',
        details: {
          originalStock: testProduct.stockCount,
          restoredQuantity: 3,
          finalStock: finalProduct.stockCount,
          expectedStock
        }
      };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error('❌ Controller test failed:', error.message);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Run all inventory sync tests
 */
export async function runAllInventoryTests() {
  console.log('🚀 Starting Inventory Sync Test Suite...\n');

  const results = [];

  // Test 1: Basic inventory sync
  console.log('=== Test 1: Basic Inventory Sync ===');
  const test1Result = await testInventorySync();
  results.push({ test: 'Basic Inventory Sync', ...test1Result });
  console.log('');

  // Test 2: Controller deleteOrder
  console.log('=== Test 2: Controller deleteOrder ===');
  const test2Result = await testDeleteOrderController();
  results.push({ test: 'Controller deleteOrder', ...test2Result });
  console.log('');

  // Summary
  console.log('=== Test Summary ===');
  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.test}: ${result.message}`);
  });

  console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Inventory sync is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the implementation.');
  }

  return results;
}
