import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Donation from '@/models/Donation';
import { getDataFromToken } from '@/lib/auth';
import { hasAdminAccess } from '@/lib/adminAuth';

async function checkAdmin() {
  const decoded = await getDataFromToken();
  if (!hasAdminAccess(decoded)) return false;
  return true;
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    if (!(await checkAdmin())) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { ids, data } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: 'No donation IDs provided' }, { status: 400 });
    }

    // Update all donations in the list with the new donor details
    await Donation.updateMany(
      { _id: { $in: ids } },
      { $set: data }
    );

    return NextResponse.json({ message: 'Donor updated successfully' });
  } catch (error: any) {
    console.error('Admin donor update error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    if (!(await checkAdmin())) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: 'No donation IDs provided' }, { status: 400 });
    }

    await Donation.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({ message: 'Donor and all associated donations deleted successfully' });
  } catch (error: any) {
    console.error('Admin donor delete error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
