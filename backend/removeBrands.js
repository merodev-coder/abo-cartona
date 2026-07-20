#!/usr/bin/env node
/**
 * Remove brands from all products in database
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { Product } from './models/Product.js';
import { connectDB } from './config/db.js';

async function removeBrands() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    console.log('🔗 Connecting to MongoDB...');
    await connectDB(mongoUri);
    
    console.log('🧹 Removing brands from all products...');
    const result = await Product.updateMany(
      {},
      { $set: { brands: [] } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} products`);
    console.log('📊 Brand removal complete!');
    
  } catch (error) {
    console.error('❌ Brand removal failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

removeBrands();
