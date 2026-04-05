import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ChevronRight, FileText, PlayCircle, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { StudentExam } from "@/components/student/StudentExam";

interface PageProps {
  params: { id: string };
}

export default async function LessonViewerPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/auth/login?callbackUrl=/lessons/" + id);
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: id },
    include: {
      course: true,
      contents: {
        orderBy: { sortOrder: "asc" }
      },
      exam: {
        include: {
          questions: {
            include: { options: true }
          },
          attempts: {
            where: { studentId: userId, passed: true },
            take: 1
          }
        }
      }
    }
  });

  if (!lesson || !lesson.isPublished) {
    notFound();
  }

  // Check purchase authorization
  let hasAccess = lesson.isFree;
  let purchase: any = null;
  
  if (!hasAccess) {
    purchase = await prisma.purchase.findFirst({
      where: {
        studentId: userId,
        lessonId: lesson.id,
        isActive: true,
      }
    });
    
    if (!purchase) {
      redirect(`/courses/${lesson.courseId}?error=unauthorized`);
    }

    // Check expiration
    if (new Date() > purchase.expiresAt) {
      return (
        <div className="flex-col items-center justify-center py-2xl gap-lg text-center animate-fade-in dashboard-theme">
          <div className="p-xl bg-error-glow/10 rounded-full text-error mb-md">
            <Clock size={64} />
          </div>
          <h1 className="text-2xl font-bold">عذراً، لقد انتهت صلاحية هذه الحصة</h1>
          <p className="text-secondary max-w-md">انتهت مدة اشتراكك في هذه الحصة بتاريخ {purchase.expiresAt.toLocaleDateString('ar-EG')}. يمكنك إعادة الشراء للحصول على وصول جديد.</p>
          <Link href={`/courses/${lesson.courseId}`} className="btn btn-primary mt-lg">العودة لصفحة الكورس</Link>
        </div>
      );
    }
    hasAccess = true;
  }

  // Check Exam requirement
  const isExamPassed = !lesson.exam || (lesson.exam.attempts.length > 0);

  // Get primary video content if it exists
  const videoContent = lesson.contents.find(c => c.type === "VIDEO");
  const attachmentContents = lesson.contents.filter(c => c.type !== "VIDEO");

  return (
    <div className="flex-col gap-xl">
      <Link href={`/courses/${lesson.courseId}`} className="flex items-center gap-xs text-secondary hover-primary mb-md" style={{ display: "inline-flex", width: "fit-content" }}>
        <ChevronRight size={18} /> العودة إلى الكورس
      </Link>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="mb-sm">{lesson.titleAr || lesson.title}</h1>
          <p className="text-secondary">{lesson.course.titleAr || lesson.course.title}</p>
        </div>
      </div>

      <div className="grid gap-2xl" style={{ gridTemplateColumns: "1fr", maxWidth: "1000px" }}>
        
        {/* Conditional Rendering: Exam vs Video */}
        {!isExamPassed ? (
          <div className="card shadow-lg p-xl md:p-2xl border-primary-glow">
            <StudentExam lessonId={id} exam={lesson.exam} studentId={userId} />
          </div>
        ) : (
          <>
            {/* Video Player Container */}
            <div className="card p-0 overflow-hidden" style={{ background: "#000", aspectRatio: "16/9", position: "relative" }}>
              {videoContent ? (
                <div className="flex items-center justify-center h-full w-full flex-col text-primary">
                  {/* Note: SecurePlayer component would go here in Phase 4 */}
                  <PlayCircle size={64} style={{ opacity: 0.8, marginBottom: "var(--space-md)" }} />
                  <p style={{ opacity: 0.8 }}>شغل الفيديو الآمن - تم تجاوز الاختبار بنجاح</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-secondary">
                  لا يوجد فيديو لهذا الدرس
                </div>
              )}
            </div>

            {/* Lesson Information & Attachments */}
            <div className="grid grid-2 gap-lg">
              <div className="card">
                <h3 className="mb-md">وصف الدرس</h3>
                <p className="text-secondary" style={{ lineHeight: 1.8 }}>
                  {lesson.description || "لا يوجد وصف."}
                </p>
              </div>

              <div className="card">
                <h3 className="mb-md">المرفقات والمذكرات</h3>
                {attachmentContents.length === 0 ? (
                  <p className="text-tertiary">لا توجد مرفقات.</p>
                ) : (
                  <div className="flex-col gap-sm">
                    {attachmentContents.map(content => (
                      <div key={content.id} className="flex items-center justify-between p-md rounded-md bg-secondary border border-color">
                        <div className="flex items-center gap-sm">
                          <FileText size={20} className="text-primary" />
                          <span>الملف {content.sortOrder}</span>
                        </div>
                        <button className="btn btn-outline btn-sm">تحميل</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
