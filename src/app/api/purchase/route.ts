import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const studentId = session?.user?.id;
    const role = (session?.user as any)?.role;

    if (!studentId || role !== "STUDENT") {
      return NextResponse.json({ error: "يجب تسجيل الدخول كطالب لشراء الدروس" }, { status: 401 });
    }

    const { lessonId } = await req.json();

    if (!lessonId) {
      return NextResponse.json({ error: "معرف الدرس مطلوب" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the lesson
      const lesson = await tx.lesson.findUnique({
        where: { id: lessonId },
        include: {
          course: {
            include: { teacher: true }
          }
        }
      });

      if (!lesson || !lesson.isPublished || lesson.deletedAt) {
        throw new Error("هذا الدرس غير متاح للشراء");
      }

      // Check if already purchased and active
      const existingPurchase = await tx.purchase.findFirst({
        where: { studentId, lessonId, isActive: true } // might need to check expiresAt
      });

      if (existingPurchase && existingPurchase.expiresAt > new Date()) {
        throw new Error("لقد قمت بشراء هذا الدرس بالفعل ولديك وصول نشط");
      }

      // 2. Check student wallet
      const studentWallet = await tx.wallet.findUnique({
        where: { userId: studentId }
      });

      if (!studentWallet) {
        throw new Error("المحفظة غير موجودة");
      }

      const price = Number(lesson.price);

      if (!lesson.isFree && Number(studentWallet.balance) < price) {
        throw new Error("رصيد المحفظة غير كافٍ. يرجى شحن الرصيد أولاً");
      }

      // 3. Calculate Expiry Date
      const accessDurationDays = lesson.accessDurationDays || 30; // default 30 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + accessDurationDays);

      // 4. If Free Lesson, bypass payment processing
      if (lesson.isFree || price === 0) {
        const purchase = await tx.purchase.create({
          data: {
            studentId,
            lessonId,
            pricePaid: 0,
            expiresAt,
            isActive: true
          }
        });
        return { success: true, isFree: true, purchaseId: purchase.id };
      }

      // 5. PAID LESSON PROCESSING
      const studentBalanceBefore = Number(studentWallet.balance);
      const studentBalanceAfter = studentBalanceBefore - price;

      // 5.a Debit Student Wallet
      await tx.wallet.update({
        where: { id: studentWallet.id },
        data: { balance: studentBalanceAfter }
      });

      // 5.b Record Student Transaction
      await tx.walletTransaction.create({
        data: {
          walletId: studentWallet.id,
          type: "PURCHASE",
          amount: price,
          balanceBefore: studentBalanceBefore,
          balanceAfter: studentBalanceAfter,
          description: `شراء درس: ${lesson.titleAr || lesson.title}`
        }
      });

      // 6. Credit Teacher Wallet
      const teacherUserId = lesson.course.teacher.userId;
      const commissionRate = Number(lesson.course.teacher.commissionRate || 0.80);
      const teacherEarning = price * commissionRate;

      const teacherWallet = await tx.wallet.findUnique({
        where: { userId: teacherUserId }
      });

      if (teacherWallet) {
        const teacherBalanceBefore = Number(teacherWallet.balance);
        const teacherBalanceAfter = teacherBalanceBefore + teacherEarning;

        await tx.wallet.update({
          where: { id: teacherWallet.id },
          data: { balance: teacherBalanceAfter }
        });

        await tx.walletTransaction.create({
          data: {
            walletId: teacherWallet.id,
            type: "EARNING",
            amount: teacherEarning,
            balanceBefore: teacherBalanceBefore,
            balanceAfter: teacherBalanceAfter,
            description: `أرباح درس: ${lesson.titleAr || lesson.title} (${commissionRate * 100}%)`
          }
        });
      }

      // 7. Create Purchase Record
      const purchase = await tx.purchase.create({
        data: {
          studentId,
          lessonId,
          pricePaid: price,
          expiresAt,
          isActive: true
        }
      });

      return { success: true, isFree: false, purchaseId: purchase.id, remainingBalance: studentBalanceAfter };
    });

    return NextResponse.json({ 
      message: "تم شراء الدرس بنجاح", 
      purchaseId: result.purchaseId,
      remainingBalance: result.remainingBalance 
    });

  } catch (error: any) {
    console.error("Purchase error:", error);
    if (["هذا الدرس غير متاح للشراء", "لقد قمت بشراء هذا الدرس بالفعل ولديك وصول نشط", "رصيد المحفظة غير كافٍ. يرجى شحن الرصيد أولاً", "المحفظة غير موجودة"].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "حدث خطأ أثناء إتمام عملية الشراء" }, { status: 500 });
  }
}
