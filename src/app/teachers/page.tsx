import { Navbar } from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Users, Award, BookOpen, Star } from "lucide-react";

export default async function TeachersPage() {
  const teachers = await prisma.teacherProfile.findMany({
    where: { isApproved: true },
    include: {
      user: true,
      _count: {
        select: { courses: true }
      }
    }
  });

  return (
    <div style={{ background: "var(--bg-secondary)", minHeight: "100vh" }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: "calc(var(--header-height) + var(--space-xl))", paddingBottom: "var(--space-3xl)" }}>
        
        {/* Header */}
        <div className="text-center mb-2xl">
          <h1 className="mb-sm">نخبة من أفضل المدرسين</h1>
          <p style={{ color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto" }}>
            تعلم على يد خبراء متخصصين في كافة المواد الدراسية للمرحلة الثانوية
          </p>
        </div>

        {/* Teachers Grid */}
        {teachers.length === 0 ? (
          <div className="card text-center py-3xl">
            <Users size={48} style={{ margin: "0 auto var(--space-md)", color: "var(--text-tertiary)" }} />
            <h3>لا يوجد مدرسين متاحين حالياً</h3>
            <p style={{ color: "var(--text-secondary)" }}>يرجى العودة لاحقاً لاكتشاف أفضل المعلمين.</p>
          </div>
        ) : (
          <div className="grid grid-3 gap-xl">
            {teachers.map(teacher => (
              <div key={teacher.id} className="card card-interactive flex-col items-center text-center p-xl">
                
                {/* Avatar */}
                <div style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "var(--bg-tertiary)",
                  position: "relative",
                  marginBottom: "var(--space-md)",
                  border: "4px solid var(--bg-card)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  overflow: "hidden"
                }}>
                  {teacher.avatarUrl ? (
                    <Image src={teacher.avatarUrl} alt={teacher.user.fullName} fill style={{ objectFit: "cover" }} />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gradient" style={{ fontSize: "2.5rem", fontWeight: 800 }}>
                      {teacher.user.fullName.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <h3 className="mb-xs" style={{ fontSize: "1.2rem" }}>أ. {teacher.user.fullName}</h3>
                <div className="badge badge-primary mb-md">
                  {teacher.specialization || "مدرس متخصص"}
                </div>
                
                <p className="text-secondary mb-lg" style={{ fontSize: "0.9rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "4rem" }}>
                  {teacher.bio || "خبير في تدريس المواد العلمية للمرحلة الثانوية بأسلوب مبسط وعملي."}
                </p>

                <div className="flex items-center justify-center gap-md text-tertiary w-full mb-lg" style={{ fontSize: "0.85rem" }}>
                  <div className="flex items-center gap-xs">
                    <BookOpen size={16} />
                    <span>{teacher._count.courses} كورسات</span>
                  </div>
                  <div className="flex items-center gap-xs text-warning">
                    <Star size={16} fill="currentColor" />
                    <span>4.9</span>
                  </div>
                </div>

                <Link href={`/courses?teacherId=${teacher.id}`} className="btn btn-outline w-full text-center">
                  عرض الكورسات
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
