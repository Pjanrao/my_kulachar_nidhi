import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getDataFromToken } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const decoded = await getDataFromToken();

    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const decoded = await getDataFromToken();

    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, email, dob, cityOrVillage, pincode, familyMembers } = body;

    if (!name || !email) {
      return NextResponse.json({ message: 'Name and Email are required' }, { status: 400 });
    }

    const updateData: any = { name, email };
    if (phone !== undefined) updateData.phone = phone;
    if (dob !== undefined) updateData.dob = dob;
    if (cityOrVillage !== undefined) updateData.cityOrVillage = cityOrVillage;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (familyMembers !== undefined) updateData.familyMembers = familyMembers;

    const user = await User.findByIdAndUpdate(
      decoded.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
