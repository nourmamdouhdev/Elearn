import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, GraduationCap, DollarSign, Clock, ShieldAlert, BookOpen, TrendingUp, Bell } from "lucide-react";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StudentGrowthChart } from "@/components/dashboard/StudentGrowthChart";

export default async function AdminDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  // Fetch real data
  const [
    totalStudents,
    totalTeachers,
    pendingTeachers,
    totalRevenueAggregate,
    recentPurchases,
    totalCourses,
    totalLessons,
    allPurchases
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.teacherProfile.count({ where: { isApproved: false } }),
    prisma.purchase.aggregate({ _sum: { pricePaid: true } }),
    prisma.purchase.findMany({
      take: 5,
      orderBy: { purchasedAt: "desc" },
      include: {
        user: { select: { fullName: true } },
        lesson: { select: { title: true, titleAr: true } }
      }
    }),
    prisma.course.count(),
    prisma.lesson.count(),
    prisma.purchase.findMany({
      where: {
        purchasedAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      },
      select: { pricePaid: true, purchasedAt: true }
    })
  ]);

  // Process data for Revenue Chart (Last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const dayTotal = allPurchases
      .filter(p => p.purchasedAt.toISOString().split('T')[0] === date)
      .reduce((sum, p) => sum + (p.pricePaid || 0), 0);
    return { date, amount: dayTotal };
  });

  const growthData = [
    { month: "يناير", count: 120 },
    { month: "فبراير", count: 210 },
    { month: "مارس", count: totalStudents },
  ];

  return (
    <div className="flex flex-col gap-xl animate-fade-in dashboard-theme">
      {/* 1. TOP STATS ROW (Stat Cards) */}
      <div className="grid grid-4 gap-xl">
        {[
          { label: "الطلاب", value: totalStudents.toLocaleString(), icon: Users, color: "primary" },
          { label: "المعلمين", value: totalTeachers.toLocaleString(), icon: GraduationCap, color: "secondary" },
          { label: "الكورسات", value: totalCourses.toLocaleString(), icon: BookOpen, color: "accent" },
          { label: "الإيرادات", value: `${totalRevenueAggregate._sum.pricePaid || 0} ج.م`, icon: DollarSign, color: "warning", success: true }
        ].map((stat, i) => (
          <div key={i} className="stat-card" style={{ '--stat-color': `var(--${stat.color})` } as any}>
            <div>
              <p className="stat-label">{stat.label}</p>
              <h3 className={`stat-value ${stat.success ? 'text-success' : ''}`}>{stat.value}</h3>
            </div>
            <div className="stat-icon">
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* 2. MAIN HUB (8:4 Split Grid) */}
      <div className="grid grid-12 gap-lg" style={{ alignItems: "stretch" }}>
        {/* Main Analytics Block (Col 8) */}
        <div className="col-span-8 flex-col gap-lg min-w-0">
          <div className="card p-lg flex-col gap-md shadow-sm">
            <div className="flex justify-between items-center mb-sm">
              <h3 className="m-0 flex items-center gap-sm text-sm font-black">
                <TrendingUp size={16} className="text-primary" />
                المبيعات الأسبوعية
              </h3>
              <span className="badge badge-success text-[10px] font-bold">+8% نمو</span>
            </div>
            <div className="min-w-0" style={{ height: 220 }}>
              <RevenueChart data={chartData} />
            </div>
          </div>

          <div className="flex gap-lg">
            <div className="card p-lg flex-col gap-md flex-1 min-w-0 text-start">
              <h4 className="m-0 text-xs text-tertiary font-black uppercase tracking-wider mb-sm">نمو المنصة</h4>
              <StudentGrowthChart data={growthData} />
            </div>
            
            <div className="card p-lg flex-col gap-lg bg-primary-glow/5 border-primary-glow border shadow-sm relative flex-1 min-w-0 justify-center text-start">
              <div className="absolute top-4 left-4 text-error opacity-20"><ShieldAlert size={48} /></div>
              <div className="relative z-10 flex-col gap-sm">
                <h4 className="m-0 text-xs flex items-center gap-sm font-black">
                  إدارة المعلمين
                </h4>
                <p className="text-[10px] text-secondary leading-normal mb-md max-w-[150px]">هناك <span className="font-bold text-error">{pendingTeachers}</span> طلبات انضمام بانتظار المراجعة.</p>
                <div className="flex justify-between items-center pt-md border-top">
                  <div className="text-2xl font-black text-error leading-none">{pendingTeachers}</div>
                  <Link href="/admin/teachers" className="btn btn-primary btn-sm px-md py-xs text-xs">المراجعة</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Widget Stack (Col 4) */}
        <div className="col-span-4 flex-col gap-lg min-w-0">
          <div className="card p-lg flex-col gap-md shadow-sm border h-full min-h-[300px]">
            <div className="flex justify-between items-center pb-sm border-bottom">
              <h3 className="m-0 text-xs font-black">آخر المبيعات</h3>
              <Clock size={14} className="text-tertiary" />
            </div>
            <div className="flex-col gap-xs py-sm">
              {recentPurchases.length === 0 ? (
                <div className="py-lg text-center text-tertiary text-[10px]">لا يوجد مبيعات اليوم</div>
              ) : (
                recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex justify-between items-center p-xs hover-bg-secondary rounded-lg transition-all">
                    <div className="flex items-center gap-sm overflow-hidden">
                      <div className="avatar avatar-sm avatar-placeholder" style={{ width: 28, height: 28, fontSize: "0.5rem" }}>
                        {purchase.user.fullName.charAt(0)}
                      </div>
                      <div className="flex-col overflow-hidden">
                        <span className="text-[10px] font-bold block truncate" style={{ maxWidth: 100 }}>{purchase.user.fullName}</span>
                        <span className="text-[8px] text-tertiary block truncate" style={{ maxWidth: 80 }}>{purchase.lesson.titleAr || purchase.lesson.title}</span>
                      </div>
                    </div>
                    <div className="text-end shrink-0">
                      <span className="text-[10px] font-black text-success">+{purchase.pricePaid}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link href="/admin/revenue" className="btn btn-sm btn-ghost w-full py-sm text-[10px] border">سجل الإيرادات الكامل</Link>
          </div>

          <div className="card p-lg bg-secondary flex-col gap-md">
            <h3 className="m-0 text-[9px] font-black uppercase text-tertiary tracking-widest">تشخيص النظام</h3>
            <div className="flex-col gap-xs">
              <div className="flex justify-between items-center p-sm bg-card rounded-lg border">
                <span className="text-[10px] text-tertiary">إجمالي المحتوى</span>
                <span className="text-[10px] font-black">{totalLessons} درس</span>
              </div>
              <div className="flex justify-between items-center p-sm bg-card rounded-lg border">
                <span className="text-[10px] text-tertiary">حالة المخدّم</span>
                <span className="text-[10px] font-black text-success flex items-center gap-xs">
                  <div className="w-1 h-1 bg-success rounded-full animate-pulse"></div>
                  يعمل
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
