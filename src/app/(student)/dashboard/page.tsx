import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Play, 
  Wallet, 
  Heart, 
  Award,
  ChevronRight,
  PlayCircle,
  TrendingUp,
  Zap
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

  // Fetch student data
  const [wallet, purchases, favoritesCount, progressCount] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId } }),
    prisma.purchase.findMany({
      where: { studentId: userId, isActive: true },
      include: {
        lesson: {
          include: { 
            course: { select: { titleAr: true, title: true } } 
          }
        }
      },
      orderBy: { purchasedAt: "desc" }
    }),
    prisma.favorite.count({ where: { userId } }),
    prisma.progress.count({ 
      where: { studentId: userId, isCompleted: true } 
    })
  ]);

  const totalLessonsPurchased = purchases.length;
  const progressPercent = totalLessonsPurchased > 0 
    ? Math.round((progressCount / totalLessonsPurchased) * 100) 
    : 0;

  const balance = wallet?.balance?.toString() || "0.00";

  return (
    <div className="flex-col gap-xl animate-fade-in dashboard-theme">
      {/* 1. TOP STATS ROW (Compact boxes + Progress) */}
      <div className="grid grid-12 gap-lg" style={{ alignItems: "stretch" }}>
        {/* Progress Card (Span 4) */}
        <div className="col-span-4 card p-lg flex items-center gap-xl bg-card border">
          <ProgressCircle percent={progressPercent} size={100} strokeWidth={8} color="var(--primary)" />
          <div className="flex-col gap-xs">
            <span className="text-[10px] font-black text-tertiary uppercase tracking-widest">إجمالي التقدم</span>
            <h3 className="m-0 text-2xl font-black">{progressPercent}%</h3>
            <p className="text-[10px] text-secondary">أتممت {progressCount} درساً</p>
          </div>
        </div>

        {/* Small Stat Hub (Span 8) */}
        <div className="col-span-8 grid grid-3 gap-lg">
          <div className="card p-lg flex-col gap-sm relative overflow-hidden group hover:border-success transition-all">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-success opacity-10 rounded-full group-hover:scale-125 transition-transform"></div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-tertiary uppercase">المحفظة</span>
              <div className="p-xs bg-success-glow rounded-lg text-success">
                <Wallet size={14} />
              </div>
            </div>
            <div className="flex items-end gap-xs">
              <h3 className="m-0 text-xl font-black">{balance}</h3>
              <span className="text-xs text-tertiary mb-1">ج.م</span>
            </div>
          </div>

          <div className="card p-lg flex-col gap-sm relative overflow-hidden group hover:border-primary transition-all">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary opacity-10 rounded-full group-hover:scale-125 transition-transform"></div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-tertiary uppercase">المفضلة</span>
              <div className="p-xs bg-primary-glow rounded-lg text-primary">
                <Heart size={14} />
              </div>
            </div>
            <h3 className="m-0 text-xl font-black">{favoritesCount}</h3>
            <span className="text-[10px] text-tertiary">درس محفوظ</span>
          </div>

          <div className="card p-lg flex-col gap-sm relative overflow-hidden group hover:border-warning transition-all">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-warning opacity-10 rounded-full group-hover:scale-125 transition-transform"></div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-tertiary uppercase">نقاط الخبرة</span>
              <div className="p-xs bg-warning-glow rounded-lg text-warning">
                <Award size={14} />
              </div>
            </div>
            <h3 className="m-0 text-xl font-black">{progressCount * 120}</h3>
            <span className="text-[10px] text-tertiary">نقطة تميز</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT HUB (2 Columns) */}
      <div className="grid grid-12 gap-xl" style={{ alignItems: "start" }}>
        {/* Purchased Lessons (Col 8) */}
        <div className="col-span-8 card p-xl flex-col gap-lg">
          <div className="flex justify-between items-center">
            <h3 className="m-0 flex items-center gap-sm text-md">
              <PlayCircle size={18} className="text-primary" />
              متابعة التعلم
            </h3>
            <Link href="/lessons" className="text-xs font-bold text-primary hover:underline flex items-center gap-xs">
              تصفح الكل <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-2 gap-md">
            {purchases.length === 0 ? (
              <div className="col-span-2 py-xl text-center text-tertiary bg-secondary rounded-xl border border-dashed">
                <p className="text-sm">لم تشترك في أي دروس بعد.</p>
                <Link href="/courses" className="btn btn-sm btn-primary mt-md">استكشف الكورسات</Link>
              </div>
            ) : (
              purchases.slice(0, 4).map((purchase) => (
                <Link 
                  key={purchase.id} 
                  href={`/lesson/${purchase.lessonId}`}
                  className="flex items-center gap-md p-md rounded-xl bg-card border hover:border-primary hover:shadow-md transition-all group overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-glow flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                    <Play size={16} fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate mb-xs">{purchase.lesson.titleAr || purchase.lesson.title}</p>
                    <p className="text-[10px] text-tertiary truncate uppercase tracking-widest">{purchase.lesson.course.titleAr || purchase.lesson.course.title}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Learning Side Sidebar (Col 4) */}
        <div className="col-span-4 flex-col gap-lg">
          <div className="card p-lg flex-col gap-lg bg-gradient-primary border border-primary-glow/20">
            <div className="flex items-center gap-sm">
              <div className="p-xs bg-primary rounded-full text-white shadow-md animate-float">
                <Zap size={16} fill="currentColor" />
              </div>
              <h3 className="m-0 text-sm font-black text-primary">المكافآت اليومية</h3>
            </div>
            <div className="flex-col gap-sm">
              <div className="flex justify-between items-center p-sm bg-card rounded-lg border">
                <span className="text-[11px] text-tertiary">سلسلة التعلم</span>
                <span className="text-xs font-black">٣ أيام 🔥</span>
              </div>
              <div className="flex justify-between items-center p-sm bg-card rounded-lg border">
                <span className="text-[11px] text-tertiary">المستوى القادم</span>
                <span className="text-[11px] font-black text-secondary">{progressCount * 120} / 1000 XP</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${(progressCount * 120 / 1000) * 100}%` }}></div>
            </div>
          </div>

          <div className="card p-lg bg-secondary flex-col gap-md">
            <h3 className="m-0 text-[10px] font-black uppercase text-tertiary tracking-widest">تلميحات ذكية</h3>
            <div className="p-sm bg-card border rounded-lg">
              <p className="text-[10px] text-secondary leading-relaxed italic">"المذاكرة الصباحية تزيد من معدل الاستيعاب بنسبة ٣٠٪! حاول البدء مبكراً اليوم." ✨</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
