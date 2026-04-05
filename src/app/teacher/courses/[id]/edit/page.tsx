import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Settings, Video, Upload, Save, Plus } from "lucide-react";
import { updateCourse } from "../../actions";

interface PageProps {
  params: { id: string };
}

export default async function TeacherCourseEditorPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const teacherProfile = await prisma.teacherProfile.findFirst({
    where: { userId }
  });

  if (!teacherProfile) redirect("/dashboard");

  // Determine if new or edit
  const isNew = id === "new";
  let course: any = null;

  if (!isNew) {
    course = await prisma.course.findFirst({
      where: { 
        id: id,
        teacherId: teacherProfile.id 
      },
      include: {
        lessons: {
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    if (!course) notFound();
  }

  const updateCourseAction = updateCourse.bind(null, course.id);

  return (
    <form action={updateCourseAction} className="flex-col gap-2xl">
      <Link href="/teacher/courses" className="flex items-center gap-xs text-secondary hover-primary mb-md" style={{ display: "inline-flex", width: "fit-content" }}>
        <ChevronRight size={18} /> العودة للكورسات
      </Link>

      <div className="flex justify-between items-center mb-lg">
        <h1>{isNew ? "إنشاء كورس جديد" : "تعديل الكورس"}</h1>
        <button type="submit" className="btn btn-primary">
          <Save size={18} /> حفظ التغييرات
        </button>
      </div>

      <div className="grid gap-2xl" style={{ gridTemplateColumns: "2fr 1fr" }}>
        
        <div className="flex-col gap-xl">
          {/* Main Info */}
          <div className="card flex-col gap-md">
            <h3 className="flex items-center gap-sm mb-sm"><Settings size={20} className="text-secondary" /> المعلومات الأساسية</h3>
            
            <div className="form-group">
              <label className="form-label">عنوان الكورس</label>
              <input name="titleAr" type="text" className="form-input" defaultValue={course?.titleAr || ""} placeholder="مثال: فيزياء الصف الثالث الثانوي - المنهج كامل" />
            </div>

            <div className="form-group">
              <label className="form-label">وصف الكورس</label>
              <textarea name="descriptionAr" className="form-input" defaultValue={course?.descriptionAr || ""} rows={4} placeholder="اكتب وصفاً تفصيلياً للكورس وما يحتويه..." />
            </div>

            <div className="grid grid-2 gap-md">
              <div className="form-group">
                <label className="form-label">المادة الدراسية</label>
                <select name="subject" className="form-input" defaultValue={course?.subject || "MATH"}>
                  <option value="MATH">رياضيات</option>
                  <option value="PHYSICS">فيزياء</option>
                  <option value="CHEMISTRY">كيمياء</option>
                  <option value="BIOLOGY">أحياء</option>
                  <option value="ARABIC">لغة عربية</option>
                  <option value="ENGLISH">لغة إنجليزية</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">الصف الدراسي</label>
                <select name="grade" className="form-input" defaultValue={course?.grade || "THIRD"}>
                  <option value="FIRST">الأول الثانوي</option>
                  <option value="SECOND">الثاني الثانوي</option>
                  <option value="THIRD">الثالث الثانوي</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lessons List (only if not new) */}
          {!isNew && (
            <div className="card flex-col gap-md">
              <div className="flex justify-between items-center mb-sm">
                <h3 className="flex items-center gap-sm"><Video size={20} className="text-secondary" /> الدروس والحصص</h3>
                <Link href={`/teacher/courses/${course.id}/lessons/new`} className="btn btn-secondary btn-sm"><Plus size={16} /> إضافة درس جديد</Link>
              </div>

              {course.lessons.length === 0 ? (
                <div className="text-center text-tertiary py-xl border-dashed" style={{ border: "2px dashed var(--border-color)", borderRadius: "var(--radius-md)" }}>
                  لم يتم إضافة أي دروس بعد. ابدأ بإضافة الدرس الأول.
                </div>
              ) : (
                <div className="flex-col gap-sm">
                  {course.lessons.map((lesson: any) => (
                    <div key={lesson.id} className="flex items-center justify-between p-md border border-color rounded-md">
                      <div className="flex items-center gap-md">
                        <div style={{ fontWeight: 600, color: "var(--text-secondary)", width: "20px" }}>{lesson.sortOrder}</div>
                        <div>
                          <p style={{ fontWeight: 600 }}>{lesson.titleAr || lesson.title}</p>
                          <div className="flex gap-sm text-sm mt-xs" style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                            <span>{lesson.price.toString() === "0" ? "مجاني" : `${lesson.price.toString()} ج.م`}</span>
                            <span>•</span>
                            <span>{lesson.durationMinutes} دقيقة</span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/teacher/courses/${course.id}/lessons/${lesson.id}/content`} className="btn btn-outline btn-sm">
                        تعديل المحتوى
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar settings */}
        <div className="flex-col gap-xl">
          <div className="card flex-col gap-md">
            <h3>الصورة المصغرة (Thumbnail)</h3>
            
            <div className="text-center py-xl bg-secondary rounded-md" style={{ border: "2px dashed var(--border-color)" }}>
              {course?.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt="Thumbnail preview" style={{ maxWidth: "100%", borderRadius: "var(--radius-sm)" }} />
              ) : (
                <div className="flex-col items-center text-tertiary">
                  <Upload size={32} className="mb-sm" />
                  <p className="mb-md text-sm">ارفع صورة جذابة بحجم 16:9</p>
                </div>
              )}
              <button className="btn btn-outline btn-sm mt-sm w-full">رفع صورة</button>
            </div>
          </div>

          <div className="card flex-col gap-md">
            <h3>السعر والنشر</h3>
            <div className="form-group">
              <label className="form-label">سعر الكورس كاملاً (اختياري)</label>
              <div className="flex items-center gap-sm">
                <input name="price" type="number" className="form-input" defaultValue={course?.price?.toString() || "0"} />
                <span className="text-secondary" style={{ whiteSpace: "nowrap" }}>ج.م</span>
              </div>
            </div>

            <div className="form-group mt-md pt-md border-top">
              <label className="flex items-center gap-sm" style={{ cursor: "pointer" }}>
                <input name="isPublished" type="checkbox" defaultChecked={course?.isPublished} style={{ width: 18, height: 18 }} />
                <span>نشر الكورس وجعله متاحاً للطلاب</span>
              </label>
            </div>
          </div>
        </div>

      </div>
    </form>
  );
}
