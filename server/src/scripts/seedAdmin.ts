import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studyq';

const ADMIN_EMAIL = 'admin@studyq.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME = 'System Admin';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model(
      'User',
      new mongoose.Schema({
        name: String,
        email: { type: String, unique: true, lowercase: true },
        password: String,
        role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
        isActive: { type: Boolean, default: true },
      }, { timestamps: true })
    );

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`⚠️  Admin user already exists: ${ADMIN_EMAIL}`);
      await mongoose.disconnect();
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    console.log(`✅ Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedAdmin();
