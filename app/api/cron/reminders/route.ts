import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Donation from '@/models/Donation';
import Notification from '@/models/Notification';
import User from '@/models/User';

// This endpoint should be triggered by a Cron Job every day at Midnight.
// Schedule: 0 0 * * *
export async function GET(req: Request) {
  try {
    console.log("Birthday cron API triggered at:", new Date().toISOString());
    // Optionally secure this endpoint with a cron secret key
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn("Unauthorized cron attempt");
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await dbConnect();

    console.log("Birthday cron API triggered");

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
        console.log(`Creating occasion reminder for user: ${userId}, type: ${occasionType}`);
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
      } else {
        console.log(`Occasion reminder already exists for user: ${userId}, type: ${occasionType}`);
      }
    }

    // --- Family Member Birthdays Logic ---
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowMonth = tomorrow.getMonth() + 1;
    const tomorrowDay = tomorrow.getDate();

    const usersWithFamily = await User.find({
      familyMembers: { $exists: true, $not: { $size: 0 } }
    });

    let birthdayCount = 0;
    for (const user of usersWithFamily) {
      for (const member of user.familyMembers) {
        if (!member.dob) continue;

        const dobDate = new Date(member.dob);
        if (isNaN(dobDate.getTime())) continue;

        // Compare month and day
        if (dobDate.getMonth() + 1 === tomorrowMonth && dobDate.getDate() === tomorrowDay) {
          console.log("Birthday matched for:", member.name);

          const title = "Birthday Reminder 🎉";
          const titleMr = "वाढदिवस स्मरण 🎉";
          const message = `Tomorrow is ${member.name}'s birthday. Celebrate this special occasion by offering blessings and making a donation.`;
          const messageMr = `उद्या ${member.name}चा वाढदिवस आहे. या शुभ दिवशी देणगी देऊन आशीर्वाद द्या.`;

          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);

          const existing = await Notification.findOne({
            userId: user._id,
            type: 'REMINDER',
            message: message, // Specific to the family member
            createdAt: { $gte: startOfDay }
          });

          if (!existing) {
            console.log(`Creating birthday notification for user: ${user._id}, member: ${member.name}`);
            await Notification.create({
              userId: user._id,
              role: 'user',
              title,
              titleMr,
              message,
              messageMr,
              type: 'REMINDER',
            });
            birthdayCount++;
          } else {
            console.log(`Birthday notification already exists for user: ${user._id}, member: ${member.name}`);
          }
        }
      }
    }

    console.log(`Cron job completed. Created ${createdCount} occasion reminders and ${birthdayCount} birthday reminders.`);

    return NextResponse.json({
      success: true,
      message: `Processed ${upcomingOccasions.length} occasions and ${usersWithFamily.length} users for birthdays. Created ${createdCount} occasion reminders and ${birthdayCount} birthday reminders.`
    });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
