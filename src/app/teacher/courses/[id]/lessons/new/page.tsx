import Link from "next/link";
import { ArrowRight, Save } from "lucide-react";
import { createLesson } from "../../../actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewLessonPage({ params }: PageProps) {
  const { id } = await params;
  const createLessonAction = createLesson.bind(null, id);

  return (
    <div className="flex-col gap-xl max-w-2xl mx-auto dashboard-theme animate-fade-in">
      <div className="flex items-center gap-md">
        <Link href={`/teacher/courses/${id}/edit`} className="btn btn-ghost btn-icon">
          <ArrowRight size={20} />
        </Link>
        <div>
          <h1 className="mb-xs text-xl">درس جديد</h1>
          <p className="text-sm text-secondary">اكتب عنوان الدرس لتتمكن من إضافة الفيديوهات والمذكرات إليه.</p>
        </div>
      </div>

      <div className="card p-xl">
        <form action={createLessonAction} className="flex-col gap-lg">
          
          <div className="form-group">
            <label htmlFor="titleAr" className="form-label">عنوان الدرس (الحصة)</label>
            <input 
              type="text" 
              id="titleAr" 
              name="titleAr" 
              className="form-input" 
              placeholder="مثال: الباب الأول - الدرس الأول: المقاومة الكهربية" 
              required 
            />
          </div>

          <div className="divider"></div>

          <div className="flex justify-end gap-md mt-sm">
            <Link href={`/teacher/courses/${id}/edit`} className="btn btn-secondary">
              إلغاء
            </Link>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              إنشاء الدرس ومتابعة لإضافة المحتوى
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
