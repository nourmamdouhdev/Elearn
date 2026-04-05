import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    
    // Check if payment was for wallet deposit
    if (session.metadata?.type === "WALLET_DEPOSIT" && session.payment_status === "paid") {
      const userId = session.metadata.userId;
      const amountInEgp = session.amount_total / 100;
      const stripePaymentId = session.payment_intent as string;

      try {
        // Run database transaction to update wallet and record payment safely
        await prisma.$transaction(async (tx) => {
          // 1. Get current wallet
          const wallet = await tx.wallet.findUnique({
            where: { userId }
          });

          if (!wallet) throw new Error("Wallet not found");

          // 2. Check if this payment was already processed (Idempotency)
          const existingPayment = await tx.payment.findFirst({
            where: { externalId: stripePaymentId, provider: "STRIPE" }
          });

          if (existingPayment) {
            console.log("Payment already processed:", stripePaymentId);
            return;
          }

          const balanceBefore = wallet.balance;
          const balanceAfter = Number(balanceBefore) + amountInEgp;

          // 3. Update Wallet Balance
          const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: balanceAfter }
          });

          // 4. Create Transaction Record
          const transaction = await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: "DEPOSIT",
              amount: amountInEgp,
              balanceBefore,
              balanceAfter,
              description: "إيداع عبر بطاقة ائتمان (Stripe)",
              referenceId: stripePaymentId,
            }
          });

          // 5. Create Payment Record linked to transaction
          await tx.payment.create({
            data: {
              userId,
              walletTransactionId: transaction.id,
              provider: "STRIPE",
              externalId: stripePaymentId,
              amount: amountInEgp,
              status: "SUCCESS",
              metadata: JSON.parse(JSON.stringify(session)),
            }
          });
        });

      } catch (error) {
        console.error("Error processing successful payment:", error);
        return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
