import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 401 });
    }

    const body = await req.json();
    const { amount } = body; // amount in EGP

    if (!amount || amount < 50) {
      return NextResponse.json({ error: "الحد الأدنى للشحن 50 جنيهاً" }, { status: 400 });
    }

    // Get user email
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user?.email,
      line_items: [
        {
          price_data: {
            currency: "egp",
            product_data: {
              name: "شحن محفظة ELearn",
              description: "رصيد يستخدم لشراء الدروس من المنصة",
            },
            unit_amount: amount * 100, // Stripe expects amount in piastres/cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        type: "WALLET_DEPOSIT",
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء إعداد عملية الدفع" }, { status: 500 });
  }
}
