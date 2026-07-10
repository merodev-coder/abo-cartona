# Inventory Sync System Documentation

## Overview

The Inventory Sync System ensures that when orders are deleted, the corresponding product stock levels are automatically restored. This maintains data integrity and prevents inventory discrepancies.

## Architecture

### 1. Database Transactions
All inventory operations use MongoDB sessions to ensure **atomic operations** - if one part fails, the entire operation is rolled back.

### 2. Multiple Implementation Approaches

#### A. Controller-Based (Primary)
- **Location**: `controllers/orderController.js` - `deleteOrder` function
- **When to use**: Direct API calls to delete orders
- **Features**: Full transaction control, detailed logging, error handling

#### B. Middleware-Based (Automatic)
- **Location**: `models/inventoryMiddleware.js`
- **When to use**: Automatic inventory management for all order operations
- **Features**: Pre/post hooks, automatic stock management

#### C. Utility Functions (Reusable)
- **Location**: `models/inventoryMiddleware.js`
- **Functions**: `restoreStockForOrder()`, `decrementStockForOrder()`
- **When to use**: Custom inventory operations

## Implementation Details

### Database Transaction Flow

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. Find order
  const order = await Order.findById(id).session(session);
  
  // 2. Restore stock
  await restoreStockForOrder(order, session);
  
  // 3. Delete order
  await Order.findByIdAndDelete(id).session(session);
  
  // 4. Commit transaction
  await session.commitTransaction();
} catch (error) {
  // Rollback on error
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### Stock Restoration Logic

```javascript
const stockRestoreOps = order.items
  .filter(item => item.product && item.quantity > 0)
  .map(item => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { stockCount: item.quantity } }
    }
  }));

await Product.bulkWrite(stockRestoreOps, { session });
```

## API Response

### Successful Order Deletion

```json
{
  "message": "تم حذف الأوردر وتحديث الجرد بنجاح",
  "orderId": "AC-12345",
  "restoredItems": 2,
  "items": [
    {
      "name": "Gaming Mouse",
      "quantity": 1,
      "productId": "507f1f77bcf86cd799439011"
    },
    {
      "name": "Gaming Keyboard",
      "quantity": 2,
      "productId": "507f1f77bcf86cd799439012"
    }
  ]
}
```

### Error Response

```json
{
  "error": "Order not found"
}
```

## Logging System

The system provides comprehensive logging for debugging and monitoring:

### Console Logs

```
[Inventory] Restored stock for 2 products in order AC-12345
[Inventory] Restored 1 units for product: Gaming Mouse (ID: 507f1f77bcf86cd799439011)
[Inventory] Restored 2 units for product: Gaming Keyboard (ID: 507f1f77bcf86cd799439012)
[Order Deletion] Failed to delete order and update inventory: Connection timeout
```

### Log Categories

- `[Inventory]`: Stock management operations
- `[Inventory Middleware]`: Automatic middleware operations
- `[Inventory Utility]`: Utility function operations
- `[Order Deletion]`: Controller-level operations

## Testing

### Test Suite Location
`tests/inventorySync.test.js`

### Running Tests

```javascript
import { runAllInventoryTests } from './tests/inventorySync.test.js';

// Run all tests
const results = await runAllInventoryTests();
console.log(results);
```

### Test Coverage

1. **Basic Inventory Sync**: Complete order lifecycle test
2. **Controller deleteOrder**: Direct controller function test
3. **Transaction Rollback**: Error handling verification
4. **Stock Accuracy**: Numerical precision verification

## Configuration

### Environment Variables

```env
# MongoDB connection (required for transactions)
MONGODB_URI=mongodb+srv://...

# Optional: Enable/disable middleware
INVENTORY_MIDDLEWARE_ENABLED=true

# Optional: Log level
INVENTORY_LOG_LEVEL=info
```

### Model Configuration

```javascript
// Product model - stock management
stockCount: { 
  type: Number, 
  default: 0,
  min: 0  // Prevents negative stock
}

// Order model - item structure
items: [{
  product: { type: ObjectId, ref: 'Product' },
  name: String,
  quantity: Number,
  price: Number
}]
```

## Performance Considerations

### Bulk Operations
- Uses `bulkWrite()` for efficient database operations
- Processes multiple items in a single database call
- Reduces network round trips

### Indexing
```javascript
// Recommended indexes for optimal performance
ProductSchema.index({ _id: 1, stockCount: 1 });
OrderSchema.index({ orderID: 1 });
OrderSchema.index({ 'items.product': 1 });
```

### Session Management
- Sessions are properly closed in `finally` blocks
- Memory leaks prevented through proper cleanup
- Concurrent operations supported

## Error Handling

### Transaction Failures
```javascript
try {
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw new Error('Inventory update failed: ' + error.message);
}
```

### Stock Validation
```javascript
// Prevents negative stock
update: { 
  $inc: { stockCount: item.quantity },
  $min: { stockCount: 0 }  // Safety constraint
}
```

### Product Not Found
```javascript
.filter(item => item.product && item.quantity > 0)
// Only processes valid product references
```

## Monitoring & Analytics

### Key Metrics
- Order deletion success rate
- Stock restoration accuracy
- Transaction rollback frequency
- Average operation duration

### Sample Monitoring Query
```javascript
// Find orders with stock issues
db.orders.find({
  "items.product": { $exists: true },
  "items.quantity": { $gt: 0 }
}).forEach(function(order) {
  order.items.forEach(function(item) {
    if (item.product) {
      const product = db.products.findOne({ _id: item.product });
      if (!product) {
        print(`Missing product reference in order ${order.orderID}`);
      }
    }
  });
});
```

## Security Considerations

### Access Control
- Only authorized users can delete orders
- Admin permissions required for inventory modifications
- Audit trail maintained for all operations

### Data Integrity
- Atomic transactions prevent partial updates
- Referential integrity validated
- Stock levels constrained to non-negative values

## Troubleshooting

### Common Issues

1. **Transaction Timeout**
   ```
   Error: Transaction timeout
   ```
   **Solution**: Increase `transactionTimeout` in MongoDB config

2. **Stock Not Restored**
   ```
   Stock count mismatch after order deletion
   ```
   **Solution**: Check product references in order items

3. **Session Leaks**
   ```
   Too many open sessions
   ```
   **Solution**: Ensure `session.endSession()` is called

### Debug Mode

```javascript
// Enable detailed logging
process.env.DEBUG = 'inventory:*';
```

## Future Enhancements

### Planned Features
1. **Real-time Inventory Updates**: WebSocket notifications
2. **Inventory History**: Track stock changes over time
3. **Automated Reordering**: Low stock alerts
4. **Multi-warehouse Support**: Location-based inventory
5. **Inventory Reports**: Analytics and insights

### Scalability Improvements
1. **Event-Driven Architecture**: Decoupled inventory updates
2. **Caching Layer**: Redis for frequent stock queries
3. **Microservices**: Separate inventory service
4. **Queue System**: Background processing for bulk operations

---

**Version**: 1.0.0  
**Last Updated**: 2025-04-03  
**Maintainer**: Abu Cartona Development Team
