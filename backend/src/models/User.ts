import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
  isActive: boolean;
  currentSemester?: number;
  academicYear?: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
    isActive: { type: Boolean, default: true },
    currentSemester: { type: Number, min: 1, max: 8 },
    academicYear: { type: Number },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
