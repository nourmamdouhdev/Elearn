import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { notFound } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { 
  PlayCircle, 
  Lock, 
  Unlock, 
  Clock, 
  Award, 
  BookOpen, 
  ChevronLeft,
  Heart
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const course = await prisma.course.findUnique({
    where: { id: id, isPublished: true },
    include: {
      teacher: {
        include: { user: true }
      },
      lessons: {
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" }
      }
    }
  });

  if (!course) {
    notFound();
  }

  // Get user's purchased lessons for this course if logged in
  let purchasedLessonIds: string[] = [];
  let isFavorite = false;

  if (userId) {
    const [purchases, favoriteRecord] = await Promise.all([
      prisma.purchase.findMany({
        where: { studentId: userId, isActive: true },
        select: { lessonId: true }
      }),
      prisma.favorite.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } }
      })
    ]);

    purchasedLessonIds = purchases.map(p => p.lessonId);
    isFavorite = !!favoriteRecord;
  }

  const coursePrice = course.price.toString();
  const isFreeCourse = coursePrice === "0";

  return (
    <div style={{ background: "var(--bg-secondary)", minHeight: "100vh" }}>
      <Navbar />
      
      {/* Hero Section */}
      <div style={{ background: "var(--bg-primary)", borderBottom: "1px solid var(--border-color)", paddingTop: "var(--header-height)" }}>
        <div className="container py-2xl">
          <Link href="/courses" className="btn btn-ghost btn-sm mb-lg" style={{ display: "inline-flex" }}>
            <ChevronLeft size={16} /> العودة للدروس
          </Link>
          
          <div className="grid grid-2 gap-2xl" style={{ alignItems: "center" }}>
            <div className="flex-col gap-md">
              <div className="flex items-center gap-sm">
                <div className="badge badge-primary">
                  {course.grade === "FIRST" ? "الصف الأول" : course.grade === "SECOND" ? "الصف الثاني" : "الصف الثالث"}
                </div>
                <div className="badge badge-secondary">{course.subject}</div>
              </div>
              
              <h1 style={{ fontSize: "2.5rem", lineHeight: 1.2 }}>{course.titleAr || course.title}</h1>
              
              <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                {course.descriptionAr || course.description || "لا يوجد وصف متوفر لهذا الدرس."}
              </p>
              
              <div className="flex items-center gap-md mt-sm">
                <div className="avatar-placeholder avatar-sm" style={{ width: 40, height: 40 }}>
                  {course.teacher.user.fullName[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{course.teacher.user.fullName}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>
                    {course.teacher.specialization || "مدرس"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-lg mt-md pt-lg" style={{ borderTop: "1px solid var(--border-color)" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>سعر الكورس</div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>
                    {isFreeCourse ? "مجاني" : `${coursePrice} ج.م`}
                  </div>
                </div>
                <div className="flex gap-sm">
                  <button className="btn btn-primary btn-lg">شراء الكورس كاملاً</button>
                  <button className={`btn ${isFavorite ? 'btn-danger' : 'btn-outline'} btn-icon`}>
                    <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="card" style={{ padding: "var(--space-sm)" }}>
              <div style={{ width: "100%", aspectRatio: "16/9", position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--bg-tertiary)" }}>
                {course.thumbnailUrl ? (
                  <Image src={course.thumbnailUrl} alt={course.title} fill style={{ objectFit: "cover" }} />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    <BookOpen size={64} style={{ color: "var(--text-tertiary)", opacity: 0.5 }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container py-2xl">
        <div className="grid gap-2xl" style={{ gridTemplateColumns: "2fr 1fr" }}>
          
          <div className="flex-col gap-lg">
            <h2>محتوى الكورس</h2>
            
            {course.lessons.length === 0 ? (
              <div className="card text-center py-xl text-tertiary">
                لا توجد حصص منشورة في هذا الكورس بعد.
              </div>
            ) : (
              <div className="flex-col gap-md">
                {course.lessons.map((lesson, idx) => {
                  const hasAccess = lesson.isFree || purchasedLessonIds.includes(lesson.id);
                  return (
                    <div key={lesson.id} className="card p-0 overflow-hidden" style={{ transition: "var(--transition-fast)" }}>
                      <div className="flex items-center justify-between p-lg" style={{ background: hasAccess ? "var(--bg-primary)" : "var(--bg-card)" }}>
                        <div className="flex items-center gap-md">
                          <div className={`feature-icon ${hasAccess ? 'feature-icon-primary' : 'feature-icon-secondary'}`} style={{ width: 48, height: 48, margin: 0 }}>
                            {hasAccess ? <PlayCircle size={24} /> : <Lock size={24} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-sm">
                              <h3 style={{ fontSize: "1.1rem" }}>{lesson.titleAr || lesson.title}</h3>
                              {lesson.isFree && <span className="badge badge-success">مجاني</span>}
                              {purchasedLessonIds.includes(lesson.id) && <span className="badge badge-primary">تم الشراء</span>}
                            </div>
                            <div className="flex items-center gap-md mt-xs text-sm text-tertiary" style={{ fontSize: "0.85rem" }}>
                              <span className="flex items-center gap-xs"><Clock size={14} /> {lesson.durationMinutes} دقيقة</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-md">
                          {!hasAccess && (
                            <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                              {lesson.price.toString()} ج.م
                            </div>
                          )}
                          
                          {hasAccess ? (
                            <Link href={`/lessons/${lesson.id}`} className="btn btn-primary btn-sm">
                              مشاهدة الدرس
                            </Link>
                          ) : (
                            <button className="btn btn-outline btn-sm">
                              شراء الحصة
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex-col gap-lg">
            <div className="card">
              <h3 className="mb-md">ماذا ستتعلم؟</h3>
              <ul className="flex-col gap-sm" style={{ paddingInlineStart: "var(--space-md)" }}>
                <li>فهم عميق شامل لأساسيات المادة</li>
                <li>تطبيقات عملية وأمثلة من امتحانات سابقة</li>
                <li>مذكرات PDF جاهزة للطباعة لكل حصة</li>
                <li>اختبارات قصيرة لتقييم مستواك</li>
              </ul>
            </div>

            <div className="card">
              <h3 className="mb-md">المتطلبات</h3>
              <div className="flex items-start gap-sm mb-sm text-secondary">
                <Award size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span>التركيز والانتباه التام أثناء شرح الدروس.</span>
              </div>
              <div className="flex items-start gap-sm text-secondary">
                <Clock size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span>الوصول للدروس يستمر لمدة {course.lessons[0]?.accessDurationDays || 30} يوماً من تاريخ الشراء للمراجعة.</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
