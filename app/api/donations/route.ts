import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Donation from '@/models/Donation';
import User from '@/models/User';
import Notification from '@/models/Notification';
import ActivityLog from '@/models/ActivityLog';
import { generateReceiptNumber } from '@/lib/utils';
import { getDataFromToken } from '@/lib/auth';
import { sendDonationReceipt } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    // Verify Razorpay Payment Signature
    if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest('hex');

      if (generated_signature !== razorpaySignature) {
        return NextResponse.json({ success: false, message: "Invalid payment signature" }, { status: 400 });
      }
    }

    // Get user details from token if authenticated
    const decoded = await getDataFromToken();
    let userId = null;
    let userRole = null;
    let userName = null;

    if (decoded && decoded.id) {
      userId = decoded.id;
      userRole = decoded.role;
      userName = decoded.name;
    }
    const donation = await Donation.create({
      ...body,
      receiptNumber: generateReceiptNumber(),
      paymentStatus: 'completed',
      ...(userId && {
        userId,
        collector: userId // Assuming the logged-in user is the collector
      }),
    });

    // Create Admin Notification
    try {
      await Notification.create({
        role: 'admin',
        title: 'New Donation Received',
        titleMr: 'नवीन देणगी प्राप्त झाली',
        message: `User ${donation.donorName} donated ₹${donation.amount} to Kulachar Nidhi.`,
        messageMr: `${donation.donorName} यांनी कुलाचार निधीला ₹${donation.amount} देणगी दिली.`,
        type: 'donation',
        amount: donation.amount,
      });

      // Create User Notification if logged in
      if (userId) {
        await Notification.create({
          userId: userId,
          role: 'user',
          title: 'Donation Successful',
          titleMr: 'देणगी यशस्वी',
          message: `🙏 Kulachar Nidhi has successfully received your donation of ₹${donation.amount}. Thank you for your contribution and support.`,
          messageMr: `🙏 कुलाचार निधीला तुमचे ₹${donation.amount} चे देणगी यशस्वीरित्या प्राप्त झाले आहे. आपल्या सहकार्याबद्दल धन्यवाद.`,
          type: 'DONATION_SUCCESS',
          amount: donation.amount,
        });
      }
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    // Log Activity if staff
    if (userId && userRole && userRole !== 'user') {
      try {
        await ActivityLog.create({
          user: userId,
          action: `${userName} collected donation from ${donation.donorName}`,
          amount: donation.amount,
          details: `Purpose: ${donation.purpose}`,
        });
      } catch (logError) {
        console.error('Failed to create activity log:', logError);
      }
    }

    // Increment user's totalDonations if authenticated
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $inc: { totalDonations: donation.amount }
      });
    }

    // Send email receipt automatically
    try {
      if (donation.email) {
        await sendDonationReceipt(donation);
      }
    } catch (emailError) {
      console.error('Failed to send email receipt:', emailError);
      // We don't throw here to avoid failing the donation response
    }

    return NextResponse.json({ success: true, data: donation }, { status: 201 });
  } catch (error: any) {
    console.error('Donation API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const donations = await Donation.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: donations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
