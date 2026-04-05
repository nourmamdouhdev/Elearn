import Link from "next/link";
import { ArrowRight, Save } from "lucide-react";
import { createCourse } from "../actions";

export default function NewCoursePage() {
  return (
    <div className="flex-col gap-xl max-w-4xl mx-auto dashboard-theme animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <Link href="/teacher/courses" className="btn btn-ghost btn-icon">
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="mb-xs text-xl">كورس جديد</h1>
            <p className="text-sm text-secondary">قم بملء البيانات الأساسية للكورس، يمكنك تعديلها لاحقاً وتجربتها قبل النشر.</p>
          </div>
        </div>
      </div>

      <div className="card p-xl">
        <form action={createCourse} className="flex-col gap-lg">
          
          <div className="grid grid-2 gap-md">
            <div className="form-group">
              <label htmlFor="titleAr" className="form-label">اسم الكورس (بالعربية)</label>
              <input 
                type="text" 
                id="titleAr" 
                name="titleAr" 
                className="form-input" 
                placeholder="مثال: كورس الفيزياء الشامل للثانوية العامة" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="price" className="form-label">سعر الكورس (ج.م)</label>
              <input 
                type="number" 
                id="price" 
                name="price" 
                className="form-input" 
                placeholder="مثال: 500" 
                min="0"
                step="0.01"
                required 
              />
            </div>
          </div>

          <div className="grid grid-2 gap-md">
            <div className="form-group">
              <label htmlFor="grade" className="form-label">الصف الدراسي</label>
              <select id="grade" name="grade" className="form-input form-select" required>
                <option value="">اختر الصف...</option>
                <option value="FIRST">الصف الأول الثانوي</option>
                <option value="SECOND">الصف الثاني الثانوي</option>
                <option value="THIRD">الصف الثالث الثانوي</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="subject" className="form-label">المادة الدراسية</label>
              <select id="subject" name="subject" className="form-input form-select" required>
                <option value="">اختر المادة...</option>
                <option value="PHYSICS">الفيزياء</option>
                <option value="CHEMISTRY">الكيمياء</option>
                <option value="MATH">الرياضيات</option>
                <option value="BIOLOGY">الأحياء</option>
                <option value="ARABIC">اللغة العربية</option>
                <option value="ENGLISH">اللغة الإنجليزية</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="descriptionAr" className="form-label">وصف الكورس</label>
            <textarea 
              id="descriptionAr" 
              name="descriptionAr" 
              className="form-input" 
              rows={5}
              placeholder="اكتب وصفاً مفصلاً لما سيقدمه هذا الكورس للطلاب..."
            ></textarea>
          </div>

          <div className="divider"></div>

          <div className="flex justify-end gap-md mt-sm">
            <Link href="/teacher/courses" className="btn btn-secondary">
              إلغاء
            </Link>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              حفظ ومتابعة لإضافة الدروس
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
