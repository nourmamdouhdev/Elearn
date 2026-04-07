import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Wallet,
  Heart,
  BookOpen,
  ChevronRight,
  PlayCircle,
  Clock,
  ShoppingCart,
} from "lucide-react";
import { ProgressCircle } from "@/components/dashboard/ProgressCircle";

export default async function StudentDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const role = (session?.user as any)?.role;
  if (role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (role === "TEACHER") {
    redirect("/teacher/dashboard");
  }

  if (!userId) return null;

  // Fetch all real student data
  const [user, wallet, purchases, favoritesCount, progressCount, recentTransactions] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true },
      }),
      prisma.wallet.findUnique({ where: { userId } }),
      prisma.purchase.findMany({
        where: { studentId: userId, isActive: true },
        include: {
          lesson: {
            include: {
              course: { select: { titleAr: true, title: true } },
            },
          },
        },
        orderBy: { purchasedAt: "desc" },
      }),
      prisma.favorite.count({ where: { userId } }),
      prisma.progress.count({
        where: { studentId: userId, isCompleted: true },
      }),
      prisma.walletTransaction.findMany({
        where: { wallet: { userId } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const totalLessonsPurchased = purchases.length;
  const progressPercent =
    totalLessonsPurchased > 0
      ? Math.round((progressCount / totalLessonsPurchased) * 100)
      : 0;

  const balance = wallet?.balance?.toString() || "0.00";
  const studentName = user?.fullName?.split(" ")[0] || "طالب";

  // Calculate expiring soon (within 7 days)
  const now = new Date();
  const expiringSoon = purchases.filter((p) => {
    const daysLeft = Math.ceil(
      (p.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft > 0 && daysLeft <= 7;
  });

  return (
    <div className="flex-col gap-xl animate-fade-in dashboard-theme">
      {/* Welcome */}
      <div>
        <h1 className="mb-xs" style={{ fontSize: "1.5rem" }}>
          أهلاً، {studentName} 👋
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          إليك ملخص نشاطك التعليمي
        </p>
      </div>

      {/* 1. TOP STATS ROW */}
      <div className="grid grid-12 gap-lg" style={{ alignItems: "stretch" }}>
        {/* Progress Card (Span 4) */}
        <div className="col-span-4 card p-lg flex items-center gap-xl bg-card border">
          <ProgressCircle
            percent={progressPercent}
            size={100}
            strokeWidth={8}
            color="var(--primary)"
          />
          <div className="flex-col gap-xs">
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 800,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              إجمالي التقدم
            </span>
            <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>
              {progressPercent}%
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              أتممت {progressCount} من {totalLessonsPurchased} درس
            </p>
          </div>
        </div>

        {/* Small Stat Hub (Span 8) */}
        <div className="col-span-8 grid grid-3 gap-lg">
          <div className="card p-lg flex-col gap-sm relative overflow-hidden group" style={{ transition: "border-color 0.3s" }}>
            <div
              className="absolute"
              style={{
                right: -16,
                top: -16,
                width: 64,
                height: 64,
                background: "var(--success)",
                opacity: 0.1,
                borderRadius: "50%",
                transition: "transform 0.3s",
              }}
            />
            <div className="flex justify-between items-center">
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                }}
              >
                المحفظة
              </span>
              <div
                style={{
                  padding: "var(--space-xs)",
                  background: "rgba(0, 212, 170, 0.12)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--success)",
                }}
              >
                <Wallet size={14} />
              </div>
            </div>
            <div className="flex items-end gap-xs">
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>
                {balance}
              </h3>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-tertiary)",
                  marginBottom: 2,
                }}
              >
                ج.م
              </span>
            </div>
          </div>

          <div className="card p-lg flex-col gap-sm relative overflow-hidden group" style={{ transition: "border-color 0.3s" }}>
            <div
              className="absolute"
              style={{
                right: -16,
                top: -16,
                width: 64,
                height: 64,
                background: "var(--primary)",
                opacity: 0.1,
                borderRadius: "50%",
              }}
            />
            <div className="flex justify-between items-center">
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                }}
              >
                الدروس المشتراة
              </span>
              <div
                style={{
                  padding: "var(--space-xs)",
                  background: "rgba(108, 99, 255, 0.12)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--primary)",
                }}
              >
                <ShoppingCart size={14} />
              </div>
            </div>
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>
              {totalLessonsPurchased}
            </h3>
            <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
              درس
            </span>
          </div>

          <div className="card p-lg flex-col gap-sm relative overflow-hidden group" style={{ transition: "border-color 0.3s" }}>
            <div
              className="absolute"
              style={{
                right: -16,
                top: -16,
                width: 64,
                height: 64,
                background: "var(--error)",
                opacity: 0.1,
                borderRadius: "50%",
              }}
            />
            <div className="flex justify-between items-center">
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                }}
              >
                المفضلة
              </span>
              <div
                style={{
                  padding: "var(--space-xs)",
                  background: "rgba(255, 107, 107, 0.12)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--error)",
                }}
              >
                <Heart size={14} />
              </div>
            </div>
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>
              {favoritesCount}
            </h3>
            <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
              كورس محفوظ
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT (2 Columns) */}
      <div className="grid grid-12 gap-xl" style={{ alignItems: "start" }}>
        {/* Purchased Lessons (Col 8) */}
        <div className="col-span-8 card p-xl flex-col gap-lg">
          <div className="flex justify-between items-center">
            <h3
              className="flex items-center gap-sm"
              style={{ margin: 0, fontSize: "1rem" }}
            >
              <PlayCircle size={18} style={{ color: "var(--primary)" }} />
              متابعة التعلم
            </h3>
            <Link
              href="/lessons"
              className="flex items-center gap-xs"
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "var(--primary)",
              }}
            >
              تصفح الكل <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-2 gap-md">
            {purchases.length === 0 ? (
              <div
                className="col-span-2 py-xl text-center rounded-xl"
                style={{
                  color: "var(--text-tertiary)",
                  background: "var(--bg-secondary)",
                  border: "1px dashed var(--border-color)",
                }}
              >
                <p style={{ fontSize: "0.9rem", marginBottom: "var(--space-md)" }}>
                  لم تشترك في أي دروس بعد.
                </p>
                <Link href="/courses" className="btn btn-sm btn-primary">
                  استكشف الكورسات
                </Link>
              </div>
            ) : (
              purchases.slice(0, 4).map((purchase) => (
                <Link
                  key={purchase.id}
                  href={`/lessons/${purchase.lessonId}`}
                  className="flex items-center gap-md p-md rounded-xl group overflow-hidden"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-md)",
                      background: "rgba(108, 99, 255, 0.1)",
                      color: "var(--primary)",
                      transition: "all 0.2s",
                    }}
                  >
                    <Play size={16} fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginBottom: 2,
                      }}
                    >
                      {purchase.lesson.titleAr || purchase.lesson.title}
                    </p>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-tertiary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {purchase.lesson.course.titleAr ||
                        purchase.lesson.course.title}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar (Col 4) */}
        <div className="col-span-4 flex-col gap-lg">
          {/* Expiring Soon */}
          {expiringSoon.length > 0 && (
            <div
              className="card p-lg flex-col gap-md"
              style={{
                border: "1px solid var(--warning)",
                background:
                  "linear-gradient(135deg, rgba(255, 185, 70, 0.05), var(--bg-card))",
              }}
            >
              <h3
                className="flex items-center gap-sm"
                style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  color: "var(--warning)",
                }}
              >
                <Clock size={16} />
                تنتهي قريباً
              </h3>
              <div className="flex-col gap-sm">
                {expiringSoon.slice(0, 3).map((p) => {
                  const daysLeft = Math.ceil(
                    (p.expiresAt.getTime() - now.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={p.id}
                      className="flex justify-between items-center p-sm rounded-lg"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "65%",
                        }}
                      >
                        {p.lesson.titleAr || p.lesson.title}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          color: daysLeft <= 2 ? "var(--error)" : "var(--warning)",
                        }}
                      >
                        {daysLeft} يوم
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="card p-lg flex-col gap-md">
            <div className="flex justify-between items-center">
              <h3
                className="flex items-center gap-sm"
                style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                }}
              >
                <Wallet size={16} style={{ color: "var(--success)" }} />
                آخر المعاملات
              </h3>
              <Link
                href="/wallet"
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--primary)",
                }}
              >
                عرض الكل
              </Link>
            </div>
            {recentTransactions.length === 0 ? (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-tertiary)",
                  textAlign: "center",
                  padding: "var(--space-md) 0",
                }}
              >
                لا توجد معاملات بعد
              </p>
            ) : (
              <div className="flex-col gap-sm">
                {recentTransactions.map((tx) => {
                  const isPositive =
                    tx.type === "DEPOSIT" ||
                    tx.type === "EARNING" ||
                    tx.type === "REFUND";
                  return (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center p-sm rounded-lg"
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "65%",
                        }}
                      >
                        {tx.description || tx.type}
                      </span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 800,
                          color: isPositive ? "var(--success)" : "var(--text-primary)",
                        }}
                      >
                        {isPositive ? "+" : "-"}
                        {tx.amount} ج.م
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card p-lg flex-col gap-md">
            <h3
              style={{
                margin: 0,
                fontSize: "0.7rem",
                fontWeight: 800,
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                letterSpacing: "0.1em",
              }}
            >
              إجراءات سريعة
            </h3>
            <Link
              href="/wallet"
              className="flex items-center gap-sm p-sm rounded-lg"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                transition: "all 0.2s",
              }}
            >
              <Wallet size={16} style={{ color: "var(--success)" }} />
              شحن المحفظة
            </Link>
            <Link
              href="/courses"
              className="flex items-center gap-sm p-sm rounded-lg"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                transition: "all 0.2s",
              }}
            >
              <BookOpen size={16} style={{ color: "var(--primary)" }} />
              تصفح الكورسات
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
