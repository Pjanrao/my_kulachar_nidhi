import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Donation from '@/models/Donation';
import Notification from '@/models/Notification';

// This endpoint should be triggered by a Cron Job (e.g., Vercel Cron) daily at midnight.
export async function GET(req: Request) {
  try {
    // Optionally secure this endpoint with a cron secret key
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await dbConnect();

    const today = new Date();

    // Calculate the date 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    // Find donations that have an occasionDate where the month and day match today or 7 days from today
    const upcomingOccasions = await Donation.aggregate([
      {
        $match: {
          userId: { $exists: true, $ne: null },
          occasionDate: { $exists: true, $ne: null },
          occasion: { $exists: true, $ne: null }
        }
      },
      {
        $project: {
          userId: 1,
          occasion: 1,
          occasionDate: 1,
          month: { $month: "$occasionDate" },
          day: { $dayOfMonth: "$occasionDate" }
        }
      },
      {
        $match: {
          $or: [
            { month: today.getMonth() + 1, day: today.getDate() },
            { month: nextWeek.getMonth() + 1, day: nextWeek.getDate() }
          ]
        }
      },
      // Group by userId and occasion to prevent duplicate notifications
      // if they donated multiple times for the same occasion
      {
        $group: {
          _id: { userId: "$userId", occasion: "$occasion" },
          occasionDate: { $first: "$occasionDate" }
        }
      }
    ]);

    let createdCount = 0;

    for (const occasion of upcomingOccasions) {
      const { userId, occasion: occasionType } = occasion._id;
      const date = new Date(occasion.occasionDate);

      const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
      const formattedDate = date.toLocaleDateString();

      const title = isToday ? `Today is your ${occasionType}!` : `Upcoming ${occasionType}`;
      const titleMr = isToday ? `आज तुमचा ${occasionType} आहे!` : `आगामी ${occasionType}`;

      const message = isToday
        ? `Wishing you a blessed ${occasionType}! Consider making a donation to Kuldaivat Trust on this auspicious day.`
        : `Your ${occasionType} is coming up on ${formattedDate}. Consider making a blessed donation to Kuldaivat Trust.`;

      const messageMr = isToday
        ? `तुम्हाला ${occasionType} च्या हार्दिक शुभेच्छा! या शुभ दिवशी कुलाचार निधीला देणगी देण्याचा विचार करा.`
        : `तुमचा ${occasionType} ${formattedDate} रोजी येत आहे. कुलाचार निधीला देणगी देण्याचा विचार करा.`;

      // Prevent creating the exact same notification again on the same day
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const existing = await Notification.findOne({
        userId: userId,
        type: 'REMINDER',
        title: title,
        createdAt: { $gte: startOfDay }
      });

      if (!existing) {
        await Notification.create({
          userId: userId,
          role: 'user',
          title: title,
          titleMr: titleMr,
          message: message,
          messageMr: messageMr,
          type: 'REMINDER',
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${upcomingOccasions.length} occasions, created ${createdCount} reminders.`
    });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
