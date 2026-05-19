import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { getDataFromToken } from '@/lib/auth';
import { hasAdminAccess } from '@/lib/adminAuth';

// GET notifications
export async function GET(req: Request) {
    try {
        await dbConnect();
        const decoded = await getDataFromToken();
        const url = new URL(req.url);
        const isAdminPanel = url.searchParams.get('admin') === 'true';

        let query: any = {};

        if (decoded) {
            if (hasAdminAccess(decoded) && isAdminPanel) {
                // Admin dashboard fetching notifications
                query = { role: 'admin' };
            } else {
                // Logged in user fetching notifications
                query = {
                    $or: [
                        { userId: decoded.id },
                        { type: { $in: ['general', 'event'] }, role: 'user' } // Public notifications
                    ]
                };
            }
        } else {
            // Not logged in, only public general/event notifications
            query = { type: { $in: ['general', 'event'] }, role: 'user' };
        }

        const data = await Notification.find(query).sort({ createdAt: -1 });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// CREATE notification
export async function POST(req: Request) {
    await dbConnect();
    const body = await req.json();

    const notif = await Notification.create(body);

    return NextResponse.json(notif);
}

// MARK ALL READ
export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const decoded = await getDataFromToken();
        const url = new URL(req.url);
        const isAdminPanel = url.searchParams.get('admin') === 'true';

        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let query: any = { isRead: false };

        if (hasAdminAccess(decoded) && isAdminPanel) {
            query.role = 'admin';
        } else {
            query.userId = decoded.id;
        }

        await Notification.updateMany(query, { isRead: true });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// CLEAR ALL
export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const decoded = await getDataFromToken();
        const url = new URL(req.url);
        const isAdminPanel = url.searchParams.get('admin') === 'true';

        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let query: any = {};

        if (hasAdminAccess(decoded) && isAdminPanel) {
            query.role = 'admin';
        } else {
            query.userId = decoded.id;
        }

        await Notification.deleteMany(query);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}