import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Plus, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Video, 
  Award,
  Calendar,
  Zap,
  ArrowUpRight
} from "lucide-react";
import { StudentGrowthChart } from "@/components/dashboard/StudentGrowthChart";

export default async function TeacherDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  // Fetch teacher data
  const teacherProfile = await prisma.teacherProfile.findFirst({
    where: { userId }
  });

  const wallet = await prisma.wallet.findUnique({
    where: { userId }
  });

  const [coursesCount, salesCount, studentsCount, recentSalesDetailed] = await Promise.all([
    prisma.course.count({
      where: { teacherId: teacherProfile?.id }
    }),
    prisma.purchase.count({
      where: {
        lesson: {
          course: {
            teacherId: teacherProfile?.id
          }
        }
      }
    }),
    prisma.user.count({
      where: {
        purchases: {
          some: {
            lesson: {
              course: {
                teacherId: teacherProfile?.id
              }
            }
          }
        }
      }
    }),
    prisma.purchase.findMany({
      where: {
        lesson: {
          course: {
            teacherId: teacherProfile?.id
          }
        }
      },
      take: 20,
      orderBy: { purchasedAt: "desc" },
      select: { purchasedAt: true }
    })
  ]);

  // Aggregate sales for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const salesData = last7Days.map(date => {
    const dayCount = recentSalesDetailed.filter(p => p.purchasedAt.toISOString().split('T')[0] === date).length;
    return { month: date.split('-')[2], count: dayCount };
  });

  const balance = wallet?.balance?.toString() || "0.00";

  return (
    <div className="flex flex-col gap-xl animate-fade-in dashboard-theme">
      {/* 1. TOP STATS ROW (Stat Cards) */}
      <div className="grid grid-4 gap-xl">
        {[
          { label: "الرصيد المتاح", value: `${balance} ج.م`, icon: CreditCard, color: "success" },
          { label: "إجمالي المبيعات", value: salesCount.toLocaleString(), icon: TrendingUp, color: "primary" },
          { label: "إجمالي المشتركين", value: studentsCount.toLocaleString(), icon: Users, color: "secondary" },
          { label: "الكورسات", value: coursesCount, icon: Video, color: "warning" }
        ].map((stat, i) => (
          <div key={i} className="stat-card" style={{ '--stat-color': `var(--${stat.color})` } as any}>
            <div>
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
            </div>
            <div className="stat-icon">
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* 2. MAIN TEACHER HUB (8:4 Split) */}
      <div className="grid grid-12 gap-lg" style={{ alignItems: "stretch" }}>
        {/* Sales Chart (Col 8) */}
        <div className="col-span-8 card p-lg flex-col gap-lg min-w-0">
          <div className="flex justify-between items-center mb-sm">
            <div className="flex items-center gap-md">
              <div className="p-sm bg-secondary-glow rounded-lg text-secondary">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="m-0 text-sm font-bold">تحليل المبيعات</h3>
                <p className="text-[10px] text-tertiary">عدد المبيعات اليومية خلال الأسبوع الماضي</p>
              </div>
            </div>
            <Link href="/teacher/courses" className="btn btn-primary btn-sm px-lg h-8">
              <Plus size={16} /> درس جديد
            </Link>
          </div>
          <div className="min-w-0 flex-1" style={{ minHeight: 250 }}>
            <StudentGrowthChart data={salesData} />
          </div>
        </div>

        {/* Side Stack (Col 4) */}
        <div className="col-span-4 flex-col gap-lg min-w-0">
          <div className="card p-lg flex-col gap-lg border-primary-glow border bg-primary-glow/5 relative overflow-hidden flex-1 min-w-0">
            <div className="absolute text-warning" style={{ top: "-1rem", right: "-1rem", opacity: 0.1 }}><Award size={80} /></div>
            <div className="flex items-center gap-sm relative z-10">
              <div className="p-xs bg-warning-glow rounded-full text-warning">
                <Award size={18} />
              </div>
              <h3 className="m-0 text-xs font-black uppercase tracking-wider">نصائح احترافية</h3>
            </div>
            
            <div className="flex-col gap-sm relative z-10">
              {[
                { title: "جودة الصوت", desc: "الطلاب يفضلون الدروس ذات الصوت الواضح.", icon: Zap, color: "secondary" },
                { title: "تفاعل الطلاب", desc: "الرد السريع يزيد مبيعاتك بنسبة ٢٠٪.", icon: TrendingUp, color: "primary" }
              ].map((tip, i) => (
                <div key={i} className="flex gap-sm p-sm bg-card rounded-lg border border-border/50 hover:border-secondary transition-all">
                  <div className={`text-${tip.color} mt-xs shrink-0`}><tip.icon size={12} fill={tip.icon === Zap ? "currentColor" : "none"} /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black mb-xs leading-none">{tip.title}</p>
                    <p className="text-[9px] text-tertiary leading-tight">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-outline btn-sm w-full py-sm mt-auto text-[10px]">دليل النجاح</button>
          </div>

          <div className="card p-lg bg-secondary flex-col gap-md flex-1 min-w-0">
            <h3 className="m-0 text-[9px] font-black uppercase text-tertiary tracking-widest">ملخص الأداء</h3>
            <div className="flex-col gap-xs">
              <div className="flex justify-between items-center p-sm bg-card rounded-lg border">
                <span className="text-[10px] text-tertiary">متوسط التقييم</span>
                <span className="text-[10px] font-bold">4.9 ⭐</span>
              </div>
              <div className="flex justify-between items-center p-sm bg-card rounded-lg border">
                <span className="text-[10px] text-tertiary">ساعات المشاهدة</span>
                <span className="text-[10px] font-bold">+1200 ساعة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
