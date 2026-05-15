import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email';
import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Save to Database
    const newContact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message
    });

    // 2. Send Email
    const emailSuccess = await sendContactEmail({ name, email, subject, message });

    return NextResponse.json({
      message: 'Message sent successfully',
      id: newContact._id,
      emailSent: emailSuccess
    });

  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
