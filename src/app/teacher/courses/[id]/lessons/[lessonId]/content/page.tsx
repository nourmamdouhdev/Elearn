import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Save, Video, FileText, UploadCloud, GripVertical } from "lucide-react";
import { updateLesson, deleteLessonContent } from "../../../../actions";
import { ExamManager } from "@/components/teacher/ExamManager";
import { FileUploader } from "@/components/teacher/FileUploader";

interface PageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

export default async function LessonContentEditorPage({ params }: PageProps) {
  const { id, lessonId } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId, courseId: id },
    include: {
      contents: {
        orderBy: { sortOrder: "asc" }
      },
      exam: {
        include: {
          questions: {
            include: {
              options: true
            },
            orderBy: { sortOrder: "asc" }
          }
        }
      }
    }
  });

  if (!lesson) notFound();

  const videoContent = lesson.contents.find(c => c.type === "VIDEO");
  const otherContents = lesson.contents.filter(c => c.type !== "VIDEO");

  return (
    <div className="flex-col gap-2xl">
      <Link href={`/teacher/courses/${id}/edit`} className="flex items-center gap-xs text-secondary hover-primary mb-md" style={{ display: "inline-flex", width: "fit-content" }}>
        <ChevronRight size={18} /> العودة للكورس
      </Link>

      <div className="flex justify-between items-center mb-lg">
        <div>
          <h1>تعديل محتوى الحصة: {lesson.titleAr || lesson.title}</h1>
        </div>
        <button type="submit" form="lessonSettingsForm" className="btn btn-primary">
          <Save size={18} /> حفظ المحتوى
        </button>
      </div>

      <div className="grid gap-2xl" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <div className="flex-col gap-xl">
          {/* Main Video Section */}
          <div className="card flex-col gap-md">
            <h3 className="flex items-center gap-sm mb-sm"><Video size={20} className="text-secondary" /> فيديو الشرح الرئيسي</h3>
            
            {videoContent ? (
              <div className="p-lg bg-secondary rounded-md" style={{ border: "1px solid var(--border-color)" }}>
                <div className="flex justify-between items-center mb-sm">
                  <span className="badge badge-primary font-bold">فيديو الشرح (محمي)</span>
                  <form action={async () => {
                    "use server";
                    await deleteLessonContent(videoContent.id, id, lessonId);
                  }}>
                    <button type="submit" className="btn btn-ghost btn-sm text-error">
                      إزالة الفيديو
                    </button>
                  </form>
                </div>
                <p className="text-secondary text-xs truncate" dir="ltr">{videoContent.fileUrl}</p>
                <div className="flex items-center gap-sm mt-md text-tertiary" style={{ fontSize: "0.85rem" }}>
                  <span>الحجم: {(videoContent.fileSizeMB?.toFixed(1) || "0")} MB</span>
                </div>
              </div>
            ) : (
              <FileUploader 
                type="VIDEO" 
                courseId={id} 
                lessonId={lessonId}
                label="اختيار فيديو الحصة" 
                description="يدعم صيغ MP4, MOV بحد أقصى 2GB."
                accept="video/*"
              />
            )}
            <p className="text-xs text-secondary mt-xs" style={{ maxWidth: 400 }}>
              ملاحظة: سيتم معالجة الفيديو تلقائياً وتشفيره (HLS AES-128) لحمايته من التحميل والسرقة قبل نشره للطلاب.
            </p>
          </div>

          {/* Attachments Section */}
          <div className="card flex-col gap-md">
            <div className="flex justify-between items-center mb-sm">
              <h3 className="flex items-center gap-sm"><FileText size={20} className="text-secondary" /> المذكرات والمرفقات (PDF)</h3>
            </div>

            <FileUploader 
              type="PDF" 
              courseId={id} 
              lessonId={lessonId}
              label="رفع ملزمة أو مذكرة" 
              description="ارفع ملفات PDF ليقوم الطلاب بتحميلها."
              accept=".pdf"
            />

            {otherContents.length === 0 ? (
              <div className="text-center text-tertiary py-xl border-dashed" style={{ border: "2px dashed var(--border-color)", borderRadius: "var(--radius-md)" }}>
                لم يتم إضافة أي مذكرات ورقية لهذه الحصة.
              </div>
            ) : (
              <div className="flex-col gap-sm">
                {otherContents.map((content) => (
                  <div key={content.id} className="flex items-center justify-between p-md border border-color rounded-md bg-secondary">
                    <div className="flex items-center gap-md">
                      <GripVertical size={18} className="text-tertiary" style={{ cursor: "grab" }} />
                      <FileText size={20} className="text-error" />
                      <div>
                        <p style={{ fontWeight: 600 }}>{content.fileUrl?.split("/").pop() || "ملف مجهول"}</p>
                <p className="text-sm text-tertiary">{content.fileSizeMB?.toString()} MB</p>
                      </div>
                    </div>
                    <form action={async () => {
                      "use server";
                      await deleteLessonContent(content.id, id, lessonId);
                    }}>
                      <button type="submit" className="btn btn-ghost btn-sm text-error">
                        حذف
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exam Manager Section */}
          <ExamManager lessonId={lessonId} exam={lesson.exam} />
        </div>

        {/* Lesson Settings Sidebar */}
        <div className="flex-col gap-xl">
          <form id="lessonSettingsForm" action={updateLesson.bind(null, id, lessonId)} className="card flex-col gap-md">
            <h3>إعدادات الحصة</h3>
            
            <div className="form-group">
              <label className="form-label">المدة التقريبية (بالدقائق)</label>
              <input name="durationMinutes" type="number" className="form-input" defaultValue={lesson.durationMinutes || 0} />
            </div>

            <div className="form-group border-top pt-md mt-md">
              <label className="form-label">نوع التسعير</label>
              <select name="pricingType" className="form-input" defaultValue={lesson.isFree ? "FREE" : "PAID"}>
                <option value="FREE">مجاني (عينة اختبارية للطلاب)</option>
                <option value="PAID">مدفوع حصرياً</option>
              </select>
            </div>

            {!lesson.isFree && (
              <>
                <div className="form-group">
                  <label className="form-label">سعر الحصة (ج.م)</label>
                  <input name="price" type="number" className="form-input" defaultValue={lesson.price?.toString() || "0"} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">فترة إتاحة المشاهدة بعد الشراء</label>
                  <select name="accessDurationDays" className="form-input" defaultValue={lesson.accessDurationDays || 30}>
                    <option value={7}>أسبوع واحد</option>
                    <option value={15}>15 يوم</option>
                    <option value={30}>شهر (30 يوم)</option>
                    <option value={90}>تيرم كامل (90 يوم)</option>
                    <option value={365}>عام دراسي كامل</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group mt-md pt-md border-top">
              <label className="flex items-center gap-sm" style={{ cursor: "pointer" }}>
                <input name="isPublished" type="checkbox" defaultChecked={lesson.isPublished} style={{ width: 18, height: 18 }} />
                <span>نشر الحصة فوراً للطلاب</span>
              </label>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
