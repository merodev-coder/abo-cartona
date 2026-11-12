import mongoose from 'mongoose';
import { createHash } from 'node:crypto';

// Atomic, shared counters. Expiration cleanup is best-effort; every key includes
// its time window, so TTL cleanup timing cannot extend a rate limit.
export class MongoRateStore {
  constructor(prefix) {
    this.prefix = prefix;
    this.localKeys = false;
  }
  init(options) {
    this.windowMs = options.windowMs;
  }
  key(key) {
    return `${this.prefix}:${Math.floor(Date.now() / this.windowMs)}:${createHash('sha256').update(key).digest('hex')}`;
  }
  async increment(key) {
    const resetTime = new Date((Math.floor(Date.now() / this.windowMs) + 1) * this.windowMs);
    const collection = mongoose.connection.collection('request_limits');
    let result;
    try {
      result = await collection.findOneAndUpdate(
        { _id: this.key(key) },
        { $inc: { hits: 1 }, $setOnInsert: { expiresAt: resetTime } },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
      result = await collection.findOneAndUpdate(
        { _id: this.key(key) },
        { $inc: { hits: 1 } },
        { returnDocument: 'after' }
      );
    }
    return { totalHits: result.hits, resetTime };
  }
  async decrement(key) {
    await mongoose.connection
      .collection('request_limits')
      .updateOne({ _id: this.key(key), hits: { $gt: 0 } }, { $inc: { hits: -1 } });
  }
  async resetKey(key) {
    await mongoose.connection.collection('request_limits').deleteOne({ _id: this.key(key) });
  }
}
