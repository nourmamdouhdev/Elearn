import { prisma } from "@/lib/prisma";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { toggleTeacherApproval } from "./actions";

export default async function AdminTeachersPage() {
  const teachers = await prisma.teacherProfile.findMany({
    include: {
      user: true,
      _count: { select: { courses: true } }
    },
    orderBy: { user: { createdAt: "desc" } }
  });

  return (
    <div className="flex-col gap-2xl">
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h1 className="mb-xs">إدارة المدرسين</h1>
          <p style={{ color: "var(--text-secondary)" }}>قم بمراجعة طلبات الانضمام والموافقة عليها لظهورها للطلاب.</p>
        </div>
      </div>

      <div className="card p-0">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", textAlign: "right" }}>
              <th style={{ padding: "var(--space-md)" }}>الاسم</th>
              <th style={{ padding: "var(--space-md)" }}>التخصص</th>
              <th style={{ padding: "var(--space-md)" }}>البريد الإلكتروني</th>
              <th style={{ padding: "var(--space-md)" }}>تاريخ الانضمام</th>
              <th style={{ padding: "var(--space-md)", textAlign: "center" }}>الحالة</th>
              <th style={{ padding: "var(--space-md)", textAlign: "left" }}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => (
              <tr key={teacher.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "var(--space-md)", fontWeight: 600 }}>أ. {teacher.user.fullName}</td>
                <td style={{ padding: "var(--space-md)", color: "var(--text-secondary)" }}>{teacher.specialization || "غير محدد"}</td>
                <td style={{ padding: "var(--space-md)", color: "var(--text-secondary)" }} dir="ltr">{teacher.user.email}</td>
                <td style={{ padding: "var(--space-md)", color: "var(--text-secondary)" }}>
                  {new Date(teacher.user.createdAt).toLocaleDateString("ar-EG")}
                </td>
                <td style={{ padding: "var(--space-md)", textAlign: "center" }}>
                  {teacher.isApproved ? (
                    <span className="badge badge-success flex items-center justify-center gap-xs m-auto">
                      <CheckCircle size={14} /> معتمد
                    </span>
                  ) : (
                    <span className="badge badge-warning flex items-center justify-center gap-xs m-auto">
                      <Clock size={14} /> معلق
                    </span>
                  )}
                </td>
                <td style={{ padding: "var(--space-md)", textAlign: "left" }}>
                  <form action={async () => {
                    "use server";
                    await toggleTeacherApproval(teacher.id, teacher.isApproved);
                  }}>
                    <button 
                      type="submit" 
                      className={`btn btn-sm ${teacher.isApproved ? 'btn-outline' : 'btn-primary'}`}
                    >
                      {teacher.isApproved ? "إلغاء الاعتماد" : "قبول وتفعيل"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            
            {teachers.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "var(--space-2xl)", textAlign: "center", color: "var(--text-tertiary)" }}>
                  لا يوجد مدرسين مسجلين حتى الآن
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
