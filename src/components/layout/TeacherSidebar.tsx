"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Video, 
  Users, 
  CreditCard, 
  BarChart, 
  LogOut,
  Settings,
  GraduationCap
} from "lucide-react";
import { signOut } from "next-auth/react";

export function TeacherSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "مركز التحكم", href: "/dashboard", icon: LayoutDashboard },
    { name: "دروسي التعليمية", href: "/courses", icon: Video },
    { name: "قاعدة الطلاب", href: "/students", icon: Users },
    { name: "سجل الأرباح", href: "/earnings", icon: CreditCard },
    { name: "التحليلات", href: "/analytics", icon: BarChart },
  ];

  return (
    <aside className="sidebar shadow-2xl">
      <div className="sidebar-header border-bottom mb-xl">
        <div className="auth-logo p-md">
          <span className="text-gradient flex items-center justify-center gap-sm" style={{ backgroundImage: "linear-gradient(135deg, var(--secondary), var(--accent))" }}>
            <GraduationCap size={32} strokeWidth={2.5} className="glow-shadow" /> 
            <span style={{ fontSize: "1.75rem", letterSpacing: "-1px", fontWeight: "900" }}>ELearn Pro</span>
          </span>
        </div>
      </div>

      <div className="sidebar-content px-sm">
        <div className="text-xs font-bold text-tertiary mb-md px-md uppercase tracking-widest opacity-50">بوابة المعلم</div>
        <div className="flex-col gap-xs">
          {links.map((link) => {
            const isActive = pathname.includes(link.href) && !pathname.includes('auth');
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.href} 
                href={`/teacher${link.href}`}
                className={`sidebar-link py-md px-lg rounded-xl transition-all ${isActive ? "active" : ""}`}
                style={{ "--primary": "var(--secondary)", "--primary-glow": "rgba(0, 212, 170, 0.1)" } as any}
              >
                <div className={`p-xs rounded-lg ${isActive ? "bg-primary-glow" : "bg-secondary"}`} style={{ opacity: isActive ? 1 : 0.7 }}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`font-bold ${isActive ? "text-primary" : ""}`}>{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="sidebar-footer mt-auto p-md border-top">
        <Link href="/teacher/settings" className={`sidebar-link mb-md py-md px-lg rounded-xl transition-all ${pathname === "/teacher/settings" ? "active" : ""}`} style={{ "--primary": "var(--secondary)", "--primary-glow": "rgba(0, 212, 170, 0.1)" } as any}>
          <Settings size={20} />
          <span>إعدادات الحساب</span>
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className="sidebar-logout w-full flex items-center justify-center gap-md py-md rounded-xl hover-bg-error-soft text-error transition-all font-bold">
          <LogOut size={20} />
          <span>الخروج من النظام</span>
        </button>
      </div>
    </aside>
  );
}
