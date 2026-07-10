import mongoose from 'mongoose';

/**
 * Inventory Sync Utilities for Order Management
 * Automatically manages stock levels when orders are created, updated, or deleted
 */

export function setupInventorySyncMiddleware(orderSchema) {
  // Pre-remove middleware: Restores stock when an order is deleted
  orderSchema.pre('deleteOne', { document: true, query: false }, async function() {
    const session = this.$session();
    
    if (this.items && this.items.length > 0) {
      // Collect all product items that need stock restoration
      const stockRestoreOps = this.items
        .filter(item => item.product && item.quantity > 0)
        .map(item => ({
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { stockCount: item.quantity } }
          }
        }));

      // Restore stock quantities if there are items to restore
      if (stockRestoreOps.length > 0) {
        try {
          const Product = mongoose.model('Product');
          const stockUpdateResult = await Product.bulkWrite(stockRestoreOps, { session });
          
          console.log(`[Inventory Middleware] Restored stock for ${stockUpdateResult.modifiedCount} products in order ${this.orderID}`);
          
          // Log detailed stock restoration
          this.items.forEach(item => {
            if (item.product) {
              console.log(`[Inventory Middleware] Restored ${item.quantity} units for product: ${item.name} (ID: ${item.product})`);
            }
          });
        } catch (error) {
          console.error('[Inventory Middleware] Failed to restore stock:', error.message);
          throw error; // This will rollback the transaction
        }
      }
    }
  });

  // Pre-save middleware: Decrements stock when a new order is created
  orderSchema.pre('save', async function() {
    // Only run on new documents (not updates)
    if (this.isNew && this.items && this.items.length > 0) {
      const session = this.$session();
      
      // Collect all product items that need stock decrement
      const stockDecrementOps = this.items
        .filter(item => item.product && item.quantity > 0)
        .map(item => ({
          updateOne: {
            filter: { _id: item.product },
            update: { 
              $inc: { stockCount: -item.quantity },
              $min: { stockCount: 0 } // Ensure stock doesn't go below 0
            }
          }
        }));

      // Decrement stock quantities if there are items to decrement
      if (stockDecrementOps.length > 0) {
        try {
          const Product = mongoose.model('Product');
          const stockUpdateResult = await Product.bulkWrite(stockDecrementOps, { session });
          
          console.log(`[Inventory Middleware] Decremented stock for ${stockUpdateResult.modifiedCount} products in order ${this.orderID}`);
          
          // Log detailed stock decrement
          this.items.forEach(item => {
            if (item.product) {
              console.log(`[Inventory Middleware] Decremented ${item.quantity} units for product: ${item.name} (ID: ${item.product})`);
            }
          });
        } catch (error) {
          console.error('[Inventory Middleware] Failed to decrement stock:', error.message);
          throw error; // This will rollback the transaction
        }
      }
    }
  });

  // Post-save middleware: Logs successful inventory updates
  orderSchema.post('save', function(doc) {
    if (doc.isNew && doc.items && doc.items.length > 0) {
      console.log(`[Inventory Middleware] Order ${doc.orderID} created and inventory updated successfully`);
    }
  });

  // Post-remove middleware: Logs successful inventory restoration
  orderSchema.post('deleteOne', { document: true, query: false }, function(doc) {
    if (doc.items && doc.items.length > 0) {
      console.log(`[Inventory Middleware] Order ${doc.orderID} deleted and inventory restored successfully`);
    }
  });
}

/**
 * Utility function to manually restore stock for a deleted order
 * This can be used in controllers as an alternative to middleware
 */
export async function restoreStockForOrder(order, session) {
  if (!order || !order.items || order.items.length === 0) {
    return { restored: 0, items: [] };
  }

  const Product = mongoose.model('Product');
  
  // Collect all product items that need stock restoration
  const stockRestoreOps = order.items
    .filter(item => item.product && item.quantity > 0)
    .map(item => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stockCount: item.quantity } }
      }
    }));

  // Restore stock quantities if there are items to restore
  if (stockRestoreOps.length > 0) {
    try {
      const stockUpdateResult = await Product.bulkWrite(stockRestoreOps, { session });
      
      console.log(`[Inventory Utility] Restored stock for ${stockUpdateResult.modifiedCount} products in order ${order.orderID}`);
      
      // Log detailed stock restoration
      const restoredItems = order.items.filter(item => item.product);
      restoredItems.forEach(item => {
        console.log(`[Inventory Utility] Restored ${item.quantity} units for product: ${item.name} (ID: ${item.product})`);
      });

      return { 
        restored: stockUpdateResult.modifiedCount, 
        items: restoredItems 
      };
    } catch (error) {
      console.error('[Inventory Utility] Failed to restore stock:', error.message);
      throw error;
    }
  }

  return { restored: 0, items: [] };
}

/**
 * Utility function to manually decrement stock for a new order
 */
export async function decrementStockForOrder(order, session) {
  if (!order || !order.items || order.items.length === 0) {
    return { decremented: 0, items: [] };
  }

  const Product = mongoose.model('Product');
  
  // Collect all product items that need stock decrement
  const stockDecrementOps = order.items
    .filter(item => item.product && item.quantity > 0)
    .map(item => ({
      updateOne: {
        filter: { _id: item.product },
        update: { 
          $inc: { stockCount: -item.quantity },
          $min: { stockCount: 0 } // Ensure stock doesn't go below 0
        }
      }
    }));

  // Decrement stock quantities if there are items to decrement
  if (stockDecrementOps.length > 0) {
    try {
      const stockUpdateResult = await Product.bulkWrite(stockDecrementOps, { session });
      
      console.log(`[Inventory Utility] Decremented stock for ${stockUpdateResult.modifiedCount} products in order ${order.orderID}`);
      
      // Log detailed stock decrement
      const decrementedItems = order.items.filter(item => item.product);
      decrementedItems.forEach(item => {
        console.log(`[Inventory Utility] Decremented ${item.quantity} units for product: ${item.name} (ID: ${item.product})`);
      });

      return { 
        decremented: stockUpdateResult.modifiedCount, 
        items: decrementedItems 
      };
    } catch (error) {
      console.error('[Inventory Utility] Failed to decrement stock:', error.message);
      throw error;
    }
  }

  return { decremented: 0, items: [] };
}
