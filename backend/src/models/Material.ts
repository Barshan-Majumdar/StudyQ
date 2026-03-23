import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMaterial extends Document {
  title: string;
  description?: string;
  subject: string;
  semester: number;
  academicYear: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: Types.ObjectId;
  tags: string[];
  downloadCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const materialSchema = new Schema<IMaterial>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    academicYear: { type: Number, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String, trim: true }],
    downloadCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

materialSchema.index({ semester: 1, subject: 1 });
materialSchema.index({ uploadedBy: 1 });
materialSchema.index({ title: 'text', subject: 'text', description: 'text' });

export const Material = mongoose.model<IMaterial>('Material', materialSchema);
