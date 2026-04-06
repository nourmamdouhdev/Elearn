import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

export default async function MyLessonsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/auth/login?callbackUrl=/lessons");
  }

  // Fetch all purchases with lesson + exam attempt data
  const purchases = await prisma.purchase.findMany({
    where: { studentId: userId },
    include: {
      lesson: {
        include: {
          course: {
            select: { titleAr: true, title: true, id: true }
          },
          exam: {
            include: {
              attempts: {
                where: { studentId: userId, passed: true },
                take: 1,
              },
            },
          },
        },
      },
    },
    orderBy: { purchasedAt: "desc" },
  });

  const now = new Date();

  // Categorize purchases
  const activePurchases = purchases.filter(p => p.isActive && p.expiresAt > now);
  const expiredPurchases = purchases.filter(p => !p.isActive || p.expiresAt <= now);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (expiresAt: Date) => {
    const diff = expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="flex-col gap-xl animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="mb-xs">دروسي</h1>
          <p className="text-secondary text-sm">جميع الحصص التي اشتريتها ومتابعة حالة كل حصة</p>
        </div>
        <div className="flex items-center gap-sm">
          <span className="badge badge-primary">{activePurchases.length} نشط</span>
          {expiredPurchases.length > 0 && (
            <span className="badge badge-error">{expiredPurchases.length} منتهية</span>
          )}
        </div>
      </div>

      {purchases.length === 0 ? (
        <div className="card flex-col items-center justify-center py-2xl gap-lg text-center">
          <div
            className="p-xl rounded-full"
            style={{ background: "rgba(108, 99, 255, 0.08)", color: "var(--primary)" }}
          >
            <BookOpen size={56} />
          </div>
          <h2>لا توجد دروس بعد</h2>
          <p className="text-secondary" style={{ maxWidth: 400 }}>
            لم تقم بشراء أي حصص حتى الآن. تصفح الكورسات المتاحة وابدأ رحلة التعلم!
          </p>
          <Link href="/courses" className="btn btn-primary mt-md">
            تصفح الكورسات
          </Link>
        </div>
      ) : (
        <div className="flex-col gap-lg">
          {/* Active Lessons */}
          {activePurchases.length > 0 && (
            <div className="flex-col gap-md">
              <h3 className="flex items-center gap-sm text-md">
                <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
                الحصص النشطة ({activePurchases.length})
              </h3>
              <div className="grid grid-2 gap-md">
                {activePurchases.map((purchase) => {
                  const lesson = purchase.lesson;
                  const daysLeft = getDaysRemaining(purchase.expiresAt);
                  const hasExam = !!lesson.exam;
                  const examPassed = hasExam && (lesson.exam?.attempts?.length ?? 0) > 0;
                  const urgencyColor =
                    daysLeft < 1
                      ? "var(--error)"
                      : daysLeft < 7
                      ? "var(--warning)"
                      : "var(--success)";

                  return (
                    <Link
                      key={purchase.id}
                      href={`/lessons/${lesson.id}`}
                      className="card p-0 overflow-hidden group"
                      style={{ transition: "all var(--transition-base)" }}
                    >
                      {/* Top accent bar */}
                      <div style={{ height: 3, background: urgencyColor }} />

                      <div className="p-lg flex-col gap-md">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h4
                              className="mb-xs"
                              style={{
                                fontSize: "1rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {lesson.titleAr || lesson.title}
                            </h4>
                            <p className="text-xs text-tertiary">
                              {lesson.course.titleAr || lesson.course.title}
                            </p>
                          </div>
                          <div
                            className="p-sm rounded-lg shrink-0"
                            style={{
                              background: "rgba(108, 99, 255, 0.1)",
                              color: "var(--primary)",
                            }}
                          >
                            <PlayCircle size={20} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Exam status */}
                          {hasExam && (
                            <div className="flex items-center gap-xs">
                              {examPassed ? (
                                <>
                                  <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
                                  <span className="text-xs" style={{ color: "var(--success)", fontWeight: 600 }}>
                                    تم اجتياز الاختبار
                                  </span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle size={14} style={{ color: "var(--warning)" }} />
                                  <span className="text-xs" style={{ color: "var(--warning)", fontWeight: 600 }}>
                                    لم يتم الاختبار
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                          {!hasExam && <div />}

                          {/* Days remaining */}
                          <div className="flex items-center gap-xs">
                            <Clock size={12} style={{ color: urgencyColor }} />
                            <span className="text-xs font-bold" style={{ color: urgencyColor }}>
                              {daysLeft} يوم متبقي
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expired Lessons */}
          {expiredPurchases.length > 0 && (
            <div className="flex-col gap-md mt-lg">
              <h3 className="flex items-center gap-sm text-md">
                <XCircle size={18} style={{ color: "var(--error)" }} />
                الحصص المنتهية ({expiredPurchases.length})
              </h3>
              <div className="grid grid-2 gap-md">
                {expiredPurchases.map((purchase) => {
                  const lesson = purchase.lesson;

                  return (
                    <div
                      key={purchase.id}
                      className="card p-0 overflow-hidden"
                      style={{ opacity: 0.6, filter: "grayscale(30%)" }}
                    >
                      {/* Top accent bar */}
                      <div style={{ height: 3, background: "var(--error)" }} />

                      <div className="p-lg flex-col gap-md">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h4
                              className="mb-xs"
                              style={{
                                fontSize: "1rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {lesson.titleAr || lesson.title}
                            </h4>
                            <p className="text-xs text-tertiary">
                              {lesson.course.titleAr || lesson.course.title}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: "var(--error)" }}>
                            انتهت بتاريخ {formatDate(purchase.expiresAt)}
                          </span>
                          <Link
                            href={`/courses/${lesson.course.id}`}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: "0.75rem", padding: "0.3rem 0.8rem" }}
                          >
                            إعادة الشراء
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
