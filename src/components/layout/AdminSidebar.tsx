"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Settings,
  LogOut,
  CreditCard
} from "lucide-react";
import { signOut } from "next-auth/react";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "الإحصائيات العامة", href: "/dashboard", icon: LayoutDashboard },
    { name: "إدارة المعلمين", href: "/teachers", icon: Users },
    { name: "قاعدة الطلاب", href: "/students", icon: GraduationCap },
    { name: "سجل الإيرادات", href: "/revenue", icon: CreditCard },
    { name: "إعدادات المنصة", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="sidebar shadow-2xl">
      <div className="sidebar-header border-bottom mb-xl">
        <div className="auth-logo p-md">
          <span className="text-gradient flex items-center justify-center gap-sm" style={{ backgroundImage: "linear-gradient(135deg, var(--error), var(--warning))" }}>
            <ShieldCheck size={32} strokeWidth={2.5} className="glow-shadow" /> 
            <span style={{ fontSize: "1.75rem", letterSpacing: "-1px", fontWeight: "900" }}>E-Admin</span>
          </span>
        </div>
      </div>

      <div className="sidebar-content px-sm">
        <div className="text-xs font-bold text-tertiary mb-md px-md uppercase tracking-widest opacity-50">الإدارة المركزية</div>
        <div className="flex-col gap-xs">
          {links.map((link) => {
            const isActive = pathname.includes(link.href) || (link.href === "/dashboard" && pathname === "/admin/dashboard");
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.href} 
                href={`/admin${link.href}`}
                className={`sidebar-link py-md px-lg rounded-xl transition-all ${isActive ? "active" : ""}`}
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
        <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className="sidebar-logout w-full flex items-center justify-center gap-md py-md rounded-xl hover-bg-error-soft text-error transition-all font-bold">
          <LogOut size={20} />
          <span>الخروج من النظام</span>
        </button>
      </div>
    </aside>
  );
}
