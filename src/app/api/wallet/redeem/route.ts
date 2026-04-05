import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code || typeof code !== "string" || code.trim() === "") {
      return NextResponse.json({ error: "الرجاء إدخال كود صحيح" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find the code
      const redemptionCode = await tx.redemptionCode.findUnique({
        where: { code: code.trim().toUpperCase() }
      });

      if (!redemptionCode) {
        throw new Error("الكود غير صحيح");
      }

      if (redemptionCode.isUsed) {
        throw new Error("هذا الكود تم استخدامه من قبل");
      }

      if (redemptionCode.expiresAt && redemptionCode.expiresAt < new Date()) {
        throw new Error("هذا الكود منتهي الصلاحية");
      }

      // 2. Get user wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId }
      });

      if (!wallet) {
        throw new Error("لم يتم العثور على محفظة المستخدم");
      }

      const amount = Number(redemptionCode.value);
      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + amount;

      // 3. Mark code as used
      await tx.redemptionCode.update({
        where: { id: redemptionCode.id },
        data: {
          isUsed: true,
          usedById: userId,
          usedAt: new Date()
        }
      });

      // 4. Update wallet balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter }
      });

      // 5. Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "DEPOSIT",
          amount: amount,
          balanceBefore,
          balanceAfter,
          description: "شحن عبر كود تفعيل",
          referenceId: redemptionCode.code,
        }
      });

      // 6. Create payment record
      await tx.payment.create({
        data: {
          userId,
          walletTransactionId: transaction.id,
          provider: "CODE",
          amount: amount,
          status: "SUCCESS"
        }
      });

      return { amount, balanceAfter };
    });

    return NextResponse.json({ 
      message: `تم شحن محفظتك بنجاح بقيمة ${result.amount} ج.م`,
      balance: result.balanceAfter 
    });

  } catch (error: any) {
    console.error("Redemption error:", error);
    // Determine if it's our thrown custom error or a db error
    if (["الكود غير صحيح", "هذا الكود تم استخدامه من قبل", "هذا الكود منتهي الصلاحية"].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "حدث خطأ أثناء 처리 الكود" }, { status: 500 });
  }
}
