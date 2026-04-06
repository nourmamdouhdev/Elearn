import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    // Retrieve the checkout session from Stripe to verify payment
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify this payment belongs to the logged-in user
    if (checkoutSession.metadata?.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify it's a wallet deposit
    if (checkoutSession.metadata?.type !== "WALLET_DEPOSIT") {
      return NextResponse.json({ error: "Invalid session type" }, { status: 400 });
    }

    // Verify payment was successful
    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const amountInEgp = (checkoutSession.amount_total || 0) / 100;
    const stripePaymentId = checkoutSession.payment_intent as string;

    // Run database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get or create wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId, balance: 0 },
        });
      }

      // Idempotency: check if this payment was already processed
      const existingPayment = await tx.payment.findFirst({
        where: { externalId: stripePaymentId, provider: "STRIPE" },
      });

      if (existingPayment) {
        return { alreadyProcessed: true, balance: wallet.balance };
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = Number(balanceBefore) + amountInEgp;

      // Update wallet balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      // Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "DEPOSIT",
          amount: amountInEgp,
          balanceBefore,
          balanceAfter,
          description: "إيداع عبر بطاقة ائتمان (Stripe)",
          referenceId: stripePaymentId,
        },
      });

      // Create payment record
      await tx.payment.create({
        data: {
          userId,
          walletTransactionId: transaction.id,
          provider: "STRIPE",
          externalId: stripePaymentId,
          amount: amountInEgp,
          status: "SUCCESS",
          metadata: JSON.stringify({
            sessionId: checkoutSession.id,
            paymentIntent: stripePaymentId,
          }),
        },
      });

      return { alreadyProcessed: false, balance: balanceAfter };
    });

    return NextResponse.json({
      success: true,
      balance: result.balance,
      alreadyProcessed: result.alreadyProcessed,
    });
  } catch (error) {
    console.error("Wallet verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
