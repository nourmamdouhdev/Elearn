import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  School,
  Calendar,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      wallet: { select: { balance: true } },
      _count: {
        select: {
          purchases: true,
          favorites: true,
        },
      },
    },
  });

  if (!user) redirect("/auth/login");

  const gradeMap: Record<string, string> = {
    FIRST: "الصف الأول الثانوي",
    SECOND: "الصف الثاني الثانوي",
    THIRD: "الصف الثالث الثانوي",
  };

  const genderMap: Record<string, string> = {
    MALE: "ذكر",
    FEMALE: "أنثى",
  };

  const joinDate = user.createdAt.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex-col gap-xl animate-fade-in" style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Profile Header */}
      <div
        className="card card-gradient flex items-center gap-xl p-2xl"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <div
          style={{
            position: "absolute",
            top: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "rgba(108, 99, 255, 0.1)",
          }}
        />
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem",
            fontWeight: 900,
            color: "white",
            flexShrink: 0,
            boxShadow: "0 8px 24px rgba(108, 99, 255, 0.25)",
          }}
        >
          {user.fullName[0]}
        </div>
        <div className="flex-col gap-xs">
          <h1 style={{ fontSize: "1.8rem", marginBottom: 0 }}>{user.fullName}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
            {user.studentProfile ? gradeMap[user.studentProfile.grade] || user.studentProfile.grade : "طالب"}
          </p>
          <div className="flex items-center gap-sm mt-xs">
            <span className="badge badge-primary">طالب</span>
            {user.isVerified && <span className="badge badge-success">مفعّل</span>}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-3 gap-lg">
        <div className="card p-lg text-center flex-col gap-xs">
          <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>
            {user._count.purchases}
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>درس تم شراؤه</span>
        </div>
        <div className="card p-lg text-center flex-col gap-xs">
          <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--error)" }}>
            {user._count.favorites}
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>في المفضلة</span>
        </div>
        <div className="card p-lg text-center flex-col gap-xs">
          <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--success)" }}>
            {user.wallet?.balance?.toString() || "0"} <span style={{ fontSize: "0.9rem" }}>ج.م</span>
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>رصيد المحفظة</span>
        </div>
      </div>

      {/* Info Card */}
      <div className="card">
        <h3 className="mb-lg" style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
          <Shield size={20} style={{ color: "var(--primary)" }} />
          المعلومات الشخصية
        </h3>

        <div className="flex-col gap-lg">
          <InfoRow icon={<User size={18} />} label="الاسم الكامل" value={user.fullName} />
          <InfoRow icon={<Mail size={18} />} label="البريد الإلكتروني" value={user.email} />
          <InfoRow icon={<Phone size={18} />} label="رقم الهاتف" value={user.phone} />
          {user.studentProfile?.parentPhone && (
            <InfoRow icon={<Phone size={18} />} label="هاتف ولي الأمر" value={user.studentProfile.parentPhone} />
          )}
          {user.studentProfile?.grade && (
            <InfoRow
              icon={<GraduationCap size={18} />}
              label="الصف الدراسي"
              value={gradeMap[user.studentProfile.grade] || user.studentProfile.grade}
            />
          )}
          {user.studentProfile?.gender && (
            <InfoRow icon={<User size={18} />} label="النوع" value={genderMap[user.studentProfile.gender] || user.studentProfile.gender} />
          )}
          {user.studentProfile?.school && (
            <InfoRow icon={<School size={18} />} label="المدرسة" value={user.studentProfile.school} />
          )}
          <InfoRow icon={<Calendar size={18} />} label="تاريخ الانضمام" value={joinDate} />
        </div>
      </div>

      {/* Edit link */}
      <div className="flex justify-end">
        <Link href="/settings" className="btn btn-primary">
          تعديل المعلومات
        </Link>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between p-md rounded-xl"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
    >
      <div className="flex items-center gap-sm" style={{ color: "var(--text-secondary)" }}>
        <span style={{ color: "var(--primary)" }}>{icon}</span>
        <span style={{ fontWeight: 600 }}>{label}</span>
      </div>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}
