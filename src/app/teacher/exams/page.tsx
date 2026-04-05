import { Video, FileText } from "lucide-react";

export default function TeacherExamsPage() {
  return (
    <div className="flex-col gap-2xl">
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h1 className="mb-xs">الامتحانات والتقييمات</h1>
          <p style={{ color: "var(--text-secondary)" }}>قم بإنشاء امتحانات إلكترونية وتصحيحها تلقائياً.</p>
        </div>
      </div>

      <div className="card text-center py-3xl" style={{ border: "2px dashed var(--border-color)" }}>
        <FileText size={48} style={{ margin: "0 auto var(--space-md)", color: "var(--text-tertiary)" }} />
        <h2 className="mb-sm">نظام الامتحانات (قيد التطوير 🚀)</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto var(--space-xl)" }}>
          قريباً جداً ستتمكن من رفع امتحانات بصيغة MCQ (اختيار من متعدد) أو رفع ملفات PDF للامتحانات المقالية لطلابك. النظام سيقوم بتصحيح الاختياري تلقائياً ورفع الدرجات.
        </p>
        <button className="btn btn-secondary" disabled>جارِ الإضافة في التحديث القادم</button>
      </div>
    </div>
  );
}
