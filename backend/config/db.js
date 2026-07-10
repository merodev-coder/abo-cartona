import mongoose from 'mongoose';

export async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }
  
  try {
    // Connect with timeout to prevent hanging
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas');
    
    // Set up connection error listener
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
    // Set up disconnection listener
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    // Set up reconnection listener
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.warn('⚠️ Continuing without database - server will run in limited mode');
    console.log('📝 Reminder: Go to MongoDB Atlas Dashboard -> Network Access and set it to "Allow Access From Anywhere (0.0.0.0/0)" so Render\'s dynamic IPs can connect');
    
    // Don't throw the error, just log it and continue
    // This allows the server to start for testing purposes
  }
}
