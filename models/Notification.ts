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
            enum: ['donation', 'event', 'general', 'DONATION_SUCCESS', 'REMINDER'],
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

// TTL index for retention policy (90 days = 7776000 seconds)
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.models.Notification ||
    mongoose.model('Notification', NotificationSchema);