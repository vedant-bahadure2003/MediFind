import mongoose from 'mongoose';

const MedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  genericName: {
    type: String,
  },
  brand: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  expiryDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

MedicineSchema.index({ name: 'text', genericName: 'text', brand: 'text' });

export default mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);