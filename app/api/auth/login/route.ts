import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  console.log('Login attempt received');
  try {
    await dbConnect();

    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json({ message: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { email, password } = body;
    console.log(`Login attempt for email: ${email}`);

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User not found: ${email}`);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Invalid password for: ${email}`);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Check approval status for roles that require manual authorization
    const rolesRequiringApproval = ['collector', 'agent', 'staff', 'chairman'];
    if (rolesRequiringApproval.includes(user.role) && user.approvalStatus !== 'approved') {
      console.log(`User not approved: ${email}, status: ${user.approvalStatus}`);
      return NextResponse.json(
        { message: `Access denied. Your account status is ${user.approvalStatus || 'pending'}.` },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    const isAdminAccess = user.role === 'admin' || user.role === 'president';
    const cookieName = isAdminAccess ? 'admin_token' : 'token';

    console.log(`Login successful for: ${email} as ${user.role}`);

    const response = NextResponse.json({
      message: 'Logged in successfully',
      token,
      cookieName,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        dob: user.dob,
        cityOrVillage: user.cityOrVillage,
        pincode: user.pincode,
        totalDonations: user.totalDonations,
      },
    });

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('CRITICAL Login error:', error);
    return NextResponse.json(
      {
        message: 'Server error during login',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}