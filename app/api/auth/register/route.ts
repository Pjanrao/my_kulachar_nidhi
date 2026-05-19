import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password, phone, dob, cityOrVillage, pincode, referralCode } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let referredBy = null;
    if (referralCode) {
      const collector = await User.findOne({ referralCode, role: 'collector' });
      if (!collector) {
        return NextResponse.json(
          { message: 'Invalid referral code.' },
          { status: 400 }
        );
      }
      if (collector.approvalStatus !== 'approved') {
        return NextResponse.json(
          { message: 'The collector associated with this referral code is not approved by the admin yet.' },
          { status: 400 }
        );
      }
      referredBy = collector._id;
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      dob,
      cityOrVillage,
      pincode,
      role: 'user', // Default role for registration
      referredBy,
      approvalStatus: 'approved',
    });

    // Create Notification
    try {
      await Notification.create({
        role: 'admin',
        title: 'New Devotee Registered',
        titleMr: 'नवीन भक्ताची नोंदणी झाली',
        message: `${user.name} (${user.email}) has joined the Kulachar Nidhi community.`,
        messageMr: `${user.name} (${user.email}) कुळाचार निधी समुदायात सामील झाले आहेत.`,
        type: 'general',
      });
    } catch (notifError) {
      console.error('Failed to create registration notification:', notifError);
    }

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Server error during registration' },
      { status: 500 }
    );
  }
}
