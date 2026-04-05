import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Video } from "lucide-react";
import Image from "next/image";

export default async function TeacherCoursesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const teacherProfile = await prisma.teacherProfile.findFirst({
    where: { userId }
  });

  const courses = await prisma.course.findMany({
    where: { teacherId: teacherProfile?.id },
    include: {
      _count: {
        select: { lessons: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex-col gap-2xl">
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h1 className="mb-xs">كورساتي</h1>
          <p style={{ color: "var(--text-secondary)" }}>قم بإدارة الكورسات، إضافة الدروس، وتعديل الأسعار.</p>
        </div>
        <Link href="/teacher/courses/new" className="btn btn-primary">
          <Plus size={18} /> كورس جديد
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="card text-center py-3xl">
          <Video size={48} style={{ margin: "0 auto var(--space-md)", color: "var(--text-tertiary)" }} />
          <h3>لم تقم بإنشاء أي كورسات بعد</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-lg)" }}>
            ابدأ رحلتك التعليمية على المنصة بإنشاء أول كورس لك.
          </p>
          <Link href="/teacher/courses/new" className="btn btn-primary">
            إنشاء كورس
          </Link>
        </div>
      ) : (
        <div className="grid grid-3 gap-lg">
          {courses.map(course => (
            <div key={course.id} className="card p-0 flex-col overflow-hidden" style={{ border: "1px solid var(--border-color)" }}>
              <div style={{ 
                width: "100%", 
                aspectRatio: "16/9", 
                background: "var(--bg-tertiary)",
                position: "relative"
              }}>
                {course.thumbnailUrl ? (
                  <Image src={course.thumbnailUrl} alt={course.title} fill style={{ objectFit: "cover" }} />
                ) : (
                  <div className="flex items-center justify-center h-full text-tertiary">بدون صورة</div>
                )}
                <div className={`badge ${course.isPublished ? 'badge-success' : 'badge-warning'}`} style={{ position: "absolute", top: "12px", right: "12px" }}>
                  {course.isPublished ? "منشور" : "مسودة"}
                </div>
              </div>

              <div className="flex-col p-lg flex-1">
                <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--space-xs)" }}>{course.titleAr || course.title}</h3>
                <div className="flex justify-between items-center text-sm text-secondary mb-md">
                  <span>{course.grade === "FIRST" ? "الأول" : course.grade === "SECOND" ? "الثاني" : "الثالث"} الثانوي</span>
                  <span>{course._count.lessons} دروس</span>
                </div>
                
                <div className="flex justify-between items-center mt-auto pt-md" style={{ borderTop: "1px solid var(--border-color)" }}>
                  <div style={{ fontWeight: 700, color: "var(--secondary)" }}>
                    {course.price.toString()} ج.م
                  </div>
                  <div className="flex gap-xs">
                    <Link href={`/courses/${course.id}`} className="btn btn-ghost btn-icon btn-sm" title="عاين الكورس">
                      <Eye size={18} />
                    </Link>
                    <Link href={`/teacher/courses/${course.id}/edit`} className="btn btn-outline btn-icon btn-sm" title="تعديل الكورس">
                      <Edit size={18} />
                    </Link>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: "var(--error)" }} title="حذف الكورس">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
