import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body.amount) {
            return NextResponse.json({ success: false, message: "Amount is required" }, { status: 400 });
        }

        const options = {
            amount: Math.round(Number(body.amount) * 100), // amount in the smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            success: true,
            order
        });

    } catch (error: any) {
        console.error("Create Razorpay Order Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create payment order",
                error: error.message
            },
            { status: 500 }
        );
    }
}
