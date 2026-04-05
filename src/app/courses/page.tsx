import { Navbar } from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, Filter, Clock, Star, BookOpen } from "lucide-react";
import Image from "next/image";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      teacher: {
        include: { user: true }
      },
      _count: {
        select: { lessons: true }
      }
    },
    orderBy: { sortOrder: "asc" }
  });

  return (
    <div style={{ background: "var(--bg-secondary)", minHeight: "100vh" }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: "calc(var(--header-height) + var(--space-xl))", paddingBottom: "var(--space-3xl)" }}>
        
        {/* Header & Search */}
        <div className="flex justify-between items-center mb-xl" style={{ flexWrap: "wrap", gap: "var(--space-md)" }}>
          <div>
            <h1 className="mb-xs">الدروس المتوفرة</h1>
            <p style={{ color: "var(--text-secondary)" }}>تصفح آلاف الدروس من أفضل المدرسين في مصر</p>
          </div>
          
          <div className="flex gap-sm">
            <div className="password-wrapper">
              <Search size={18} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: "12px", color: "var(--text-tertiary)" }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="ابحث عن مادة، مدرس..."
                style={{ paddingInlineStart: "40px", minWidth: "300px" }}
              />
            </div>
            <button className="btn btn-secondary btn-icon">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Filters (Basic) */}
        <div className="tabs mb-xl" style={{ display: "inline-flex" }}>
          <button className="tab active">الكل</button>
          <button className="tab">الصف الأول</button>
          <button className="tab">الصف الثاني</button>
          <button className="tab">الصف الثالث</button>
        </div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <div className="card text-center py-3xl">
            <BookOpen size={48} style={{ margin: "0 auto var(--space-md)", color: "var(--text-tertiary)" }} />
            <h3>لا توجد دروس متاحة حالياً</h3>
            <p style={{ color: "var(--text-secondary)" }}>يرجى العودة لاحقاً أو تغيير معايير البحث.</p>
          </div>
        ) : (
          <div className="grid grid-3 gap-lg">
            {courses.map(course => (
              <Link href={`/courses/${course.id}`} key={course.id}>
                <div className="card card-interactive p-0 h-full flex-col overflow-hidden" style={{ border: "1px solid var(--border-color)" }}>
                  {/* Thumbnail Placeholder */}
                  <div style={{ 
                    width: "100%", 
                    aspectRatio: "16/9", 
                    background: "var(--bg-tertiary)",
                    position: "relative"
                  }}>
                    {course.thumbnailUrl ? (
                      <Image src={course.thumbnailUrl} alt={course.title} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gradient" style={{ fontWeight: 800, fontSize: "1.5rem" }}>
                        {course.subject}
                      </div>
                    )}
                    <div className="badge badge-primary" style={{ position: "absolute", top: "12px", right: "12px", background: "var(--glass-bg)", backdropFilter: "var(--glass-blur)" }}>
                      {course.grade === "FIRST" ? "الصف الأول" : course.grade === "SECOND" ? "الصف الثاني" : "الصف الثالث"}
                    </div>
                  </div>

                  <div className="flex-col p-lg flex-1">
                    <div className="flex justify-between items-start mb-sm">
                      <h3 style={{ fontSize: "1.1rem", lineHeight: 1.4 }}>{course.titleAr || course.title}</h3>
                    </div>
                    
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {course.descriptionAr || course.description || "لا يوجد وصف."}
                    </p>

                    <div className="divider my-md" style={{ margin: "var(--space-sm) 0" }} />

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-xs text-secondary" style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>
                        <div className="avatar-placeholder avatar-sm" style={{ width: 24, height: 24, fontSize: "0.7rem" }}>
                          {course.teacher.user.fullName[0]}
                        </div>
                        {course.teacher.user.fullName}
                      </div>

                      <div className="flex items-center gap-xs" style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>
                        <BookOpen size={14} />
                        {course._count.lessons} دروس
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-md pt-md" style={{ borderTop: "1px dashed var(--border-color)" }}>
                      <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--primary)" }}>
                        {course.price.toString() === "0" ? "مجاني" : `${course.price.toString()} ج.م`}
                      </div>
                      <span className="btn btn-secondary btn-sm">التفاصيل</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
