import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { getDataFromToken } from '@/lib/auth';
import { hasAdminAccess } from '@/lib/adminAuth';
import mongoose from 'mongoose';

// GET notifications
export async function GET(req: Request) {
    try {
        await dbConnect();
        const decoded = await getDataFromToken();
        const url = new URL(req.url);
        const isAdminPanel = url.searchParams.get('admin') === 'true';

        let query: any = {};

        if (decoded) {
            const userId = decoded.id;
            console.log('AUTH SUCCESS: Fetching notifications for user ID:', userId);
            
            if (hasAdminAccess(decoded) && isAdminPanel) {
                // Admin dashboard fetching notifications
                query = { role: 'admin' };
            } else {
                // Logged in user fetching notifications
                // Explicitly cast to ObjectId for robust matching inside $or
                let userObjId;
                try {
                    userObjId = new mongoose.Types.ObjectId(userId);
                } catch (e) {
                    console.error('AUTH ERROR: Invalid user ID format:', userId);
                }
                
                query = {
                    $or: [
                        { userId: userObjId },
                        { type: { $in: ['general', 'event'] }, role: 'user' } // Public notifications
                    ]
                };
            }
        } else {
            console.log('AUTH INFO: Not logged in, fetching public notifications only');
            // Not logged in, only public general/event notifications
            query = { type: { $in: ['general', 'event'] }, role: 'user' };
        }

        console.log('Final Notification Query:', JSON.stringify(query));
        const data = await Notification.find(query).sort({ createdAt: -1 });
        console.log(`Found ${data.length} notifications matching query.`);
        if (data.length > 0) {
            console.log('Sample Notification [0]:', JSON.stringify({
                _id: data[0]._id,
                userId: data[0].userId,
                type: data[0].type,
                title: data[0].title
            }));
        }
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