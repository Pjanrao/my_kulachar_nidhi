import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'chairman', 'collector', 'president', 'agent', 'staff'],
    default: 'user',
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  },
  permissions: {
    canCollectDonations: { type: Boolean, default: false },
    canGenerateReceipts: { type: Boolean, default: false },
    canViewReports: { type: Boolean, default: false },
    canEditBankDetails: { type: Boolean, default: false },
    canDeleteDonations: { type: Boolean, default: false },
  },
  phone: String,
  dob: String,
  cityOrVillage: String,
  pincode: String,
  totalDonations: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

delete mongoose.models.User;
export default mongoose.models.User || mongoose.model('User', UserSchema);
