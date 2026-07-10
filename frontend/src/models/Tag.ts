import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true }
);

export type TagDoc = mongoose.InferSchemaType<typeof tagSchema> & { _id: mongoose.Types.ObjectId };

export const Tag = mongoose.models.Tag || mongoose.model('Tag', tagSchema);
