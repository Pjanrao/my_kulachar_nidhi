import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Notification from '@/models/Notification';
import { getDataFromToken } from '@/lib/auth';
import { hasAdminAccess } from '@/lib/adminAuth';

// DELETE
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    const { id } = await params;
    
    const decoded = await getDataFromToken();
    if (!decoded) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notif = await Notification.findById(id);
    if (!notif) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Only admin can delete admin notifications or broadcasts. Users can only delete their own.
    const url = new URL(req.url);
    const isAdminPanel = url.searchParams.get('admin') === 'true';

    if (isAdminPanel) {
        if (!hasAdminAccess(decoded)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    } else {
        if (notif.userId?.toString() !== decoded.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    await Notification.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
}

// MARK AS READ
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    const { id } = await params;

    const decoded = await getDataFromToken();
    if (!decoded) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updated = await Notification.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
    );

    return NextResponse.json(updated);
}