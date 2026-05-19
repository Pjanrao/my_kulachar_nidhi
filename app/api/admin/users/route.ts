import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Donation from '@/models/Donation';
import { getDataFromToken } from '@/lib/auth';
import { hasAdminAccess } from '@/lib/adminAuth';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const decoded = await getDataFromToken();

    if (!hasAdminAccess(decoded)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role');

    // Get the start of the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    if (roleParam === 'staff') {
      const users = await User.aggregate([
        { $match: { role: { $ne: 'user' } } }, // Only fetch staff/admins/collectors
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'referredBy',
            as: 'referrals'
          }
        },
        {
          $lookup: {
            from: 'donations',
            let: { 
              collectorId: '$_id', 
              referralIds: '$referrals._id' 
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$paymentStatus', 'completed'] },
                      {
                        $or: [
                          { $eq: ['$collector', '$$collectorId'] },
                          { $in: ['$userId', '$$referralIds'] }
                        ]
                      }
                    ]
                  }
                }
              }
            ],
            as: 'allCollections'
          }
        },
        {
          $addFields: {
            totalCollected: { $sum: '$allCollections.amount' },
            receiptCount: { $size: '$allCollections' },
            monthlyCollection: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$allCollections',
                      as: 'd',
                      cond: { $gte: ['$$d.createdAt', startOfMonth] }
                    }
                  },
                  as: 'f',
                  in: '$$f.amount'
                }
              }
            },
            activeDonors: {
              $size: {
                $setUnion: {
                  $map: {
                    input: '$allCollections',
                    as: 'd',
                    in: '$$d.mobileNumber'
                  }
                }
              }
            }
          }
        },
        { $project: { password: 0, allCollections: 0, referrals: 0 } },
        { $sort: { createdAt: -1 } }
      ]);
      return new Response(JSON.stringify(users || []), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Default: Return normal users (devotees)
      const users = await User.find({ role: 'user' }, '-password')
        .populate('referredBy', 'name email phone')
        .sort({ createdAt: -1 })
        .lean();
      return new Response(JSON.stringify(users || []), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error: any) {
    console.error('Admin users fetch error:', error);
    return new Response(JSON.stringify({ message: 'Server error', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
