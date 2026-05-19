import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        title: String,
        titleMr: String,
        message: String,
        messageMr: String,
        type: {
            type: String,
            enum: ['donation', 'event', 'general'],
            default: 'general',
        },
        amount: Number,
        language: String,
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Notification ||
    mongoose.model('Notification', NotificationSchema);