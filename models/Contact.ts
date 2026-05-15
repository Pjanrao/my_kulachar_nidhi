import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
  },
  phone: {
    type: String,
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'responded', 'archived'],
    default: 'pending',
  },
}, { timestamps: true });

// Prevent multiple model compilation in development
delete mongoose.models.Contact;
export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
