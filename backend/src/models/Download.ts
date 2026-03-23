import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDownload extends Document {
  userId: Types.ObjectId;
  materialId: Types.ObjectId;
  createdAt: Date;
}

const downloadSchema = new Schema<IDownload>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    materialId: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
  },
  { timestamps: true }
);

downloadSchema.index({ userId: 1 });
downloadSchema.index({ materialId: 1 });
downloadSchema.index({ createdAt: -1 });

export const Download = mongoose.model<IDownload>('Download', downloadSchema);
