import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const options = {
            amount: body.amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            success: true,
            order
        });

    } catch (error: any) {
        console.error("Create Order Error:", error);

        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}