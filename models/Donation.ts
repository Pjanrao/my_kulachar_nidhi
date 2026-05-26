import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
  donorType: {
    type: String,
    enum: ['individual', 'organization'],
    default: 'individual',
  },
  donorName: {
    type: String,
    required: [true, 'Please provide donor name'],
  },
  email: String,
  mobileNumber: {
    type: String,
    required: [true, 'Please provide mobile number'],
  },
  panNumber: String,
  address: String,
  amount: {
    type: Number,
    required: [true, 'Please provide amount'],
  },
  purpose: String,
  occasion: String,
  occasionDate: Date,
  reason: {
    type: String,
    required: [true, 'Please provide reason'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    default: 'UPI',
  },
  transactionId: String,
  razorpayPaymentId: String,
  razorpayOrderId: String,
  razorpaySignature: String,
  receiptNumber: {
    type: String,
    unique: true,
  },
  collector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  donationDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.models.Donation || mongoose.model('Donation', DonationSchema);
