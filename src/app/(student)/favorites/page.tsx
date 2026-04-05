import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Heart, Search } from "lucide-react";
import Image from "next/image";

export default async function FavoritesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      favorites: {
        include: {
          course: {
            include: {
              teacher: { include: { user: true } },
              _count: { select: { lessons: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  const favorites = user?.favorites || [];

  return (
    <div className="flex-col gap-2xl">
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h1 className="mb-xs">المفضلة</h1>
          <p style={{ color: "var(--text-secondary)" }}>الدروس التي قمت بحفظها للرجوع إليها لاحقاً</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="card text-center py-3xl">
          <Heart size={48} style={{ margin: "0 auto var(--space-md)", color: "var(--text-tertiary)" }} />
          <h3>لا توجد دروس في المفضلة</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-lg)" }}>
            تصفح المحتوى وأضف الدروس التي تهمك إلى المفضلة.
          </p>
          <Link href="/courses" className="btn btn-primary">
            <Search size={18} /> تصفح الدروس
          </Link>
        </div>
      ) : (
        <div className="grid grid-3 gap-lg">
          {favorites.map(({ course }) => (
            <Link href={`/courses/${course.id}`} key={course.id}>
              <div className="card card-interactive p-0 h-full flex-col overflow-hidden" style={{ border: "1px solid var(--primary-glow)" }}>
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
                  {/* Heart icon filled indicator */}
                  <div className="feature-icon" style={{ 
                    position: "absolute", top: "12px", right: "12px", 
                    background: "var(--glass-bg)", backdropFilter: "var(--glass-blur)",
                    width: 32, height: 32, padding: 0, margin: 0, color: "var(--error)"
                  }}>
                    <Heart size={16} fill="currentColor" />
                  </div>
                </div>

                <div className="flex-col p-lg flex-1">
                  <h3 style={{ fontSize: "1.1rem", lineHeight: 1.4, marginBottom: "var(--space-xs)" }}>
                    {course.titleAr || course.title}
                  </h3>
                  
                  <div className="flex justify-between items-center mt-auto pt-md">
                    <div style={{ fontWeight: 800, color: "var(--primary)" }}>
                      {course.price.toString() === "0" ? "مجاني" : `${course.price.toString()} ج.م`}
                    </div>
                    <span className="btn btn-outline btn-sm">التفاصيل</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
