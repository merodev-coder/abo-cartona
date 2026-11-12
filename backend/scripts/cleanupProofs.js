import 'dotenv/config';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';
import { PaymentProof } from '../models/PaymentProof.js';
import { deleteProof } from '../utils/proofStorage.js';

// Run as a single scheduled job. Never TTL-delete metadata before deleting the
// private object: keeping the record permits safe retry after a storage outage.
await connectDB(process.env.MONGODB_URI);
try {
  const cursor = PaymentProof.find({ order: null, expiresAt: { $lt: new Date() } }).cursor();
  for await (const proof of cursor) {
    const claimed = await PaymentProof.findOneAndUpdate(
      { _id: proof._id, order: null, expiresAt: { $lt: new Date() } },
      { $set: { expiresAt: new Date(0) } }
    );
    if (!claimed) continue;
    await deleteProof(proof.key);
    await PaymentProof.deleteOne({ _id: proof._id, order: null });
  }
} finally {
  await mongoose.disconnect();
}
