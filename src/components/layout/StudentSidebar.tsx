"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Heart, 
  Wallet, 
  LogOut,
  User,
  Settings
} from "lucide-react";
import { signOut } from "next-auth/react";

export function StudentSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
    { name: "مكتبة الدروس", href: "/courses", icon: BookOpen },
    { name: "قائمة المفضلة", href: "/favorites", icon: Heart },
    { name: "محفظتي المالية", href: "/wallet", icon: Wallet },
  ];

  return (
    <aside className="sidebar shadow-2xl">
      <div className="sidebar-header border-bottom mb-xl">
        <div className="auth-logo p-md">
          <span className="text-gradient flex items-center justify-center gap-sm" style={{ backgroundImage: "linear-gradient(135deg, var(--primary), var(--secondary))" }}>
            <BookOpen size={32} strokeWidth={2.5} className="glow-shadow" /> 
            <span style={{ fontSize: "1.75rem", letterSpacing: "-1px", fontWeight: "900" }}>E-Learn</span>
          </span>
        </div>
      </div>

      <div className="sidebar-content px-sm">
        <div className="text-xs font-bold text-tertiary mb-md px-md uppercase tracking-widest opacity-50">بوابة الطالب</div>
        <div className="flex-col gap-xs">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href === "/dashboard" && pathname === "/dashboard");
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
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
        <div className="flex-col gap-xs mb-md">
          <Link href="/profile" className={`sidebar-link py-md px-lg rounded-xl transition-all ${pathname === "/profile" ? "active" : ""}`}>
            <User size={20} />
            <span className="font-bold">الملف الشخصي</span>
          </Link>
          <Link href="/settings" className={`sidebar-link py-md px-lg rounded-xl transition-all ${pathname === "/settings" ? "active" : ""}`}>
            <Settings size={20} />
            <span className="font-bold">الإعدادات</span>
          </Link>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className="sidebar-logout w-full flex items-center justify-center gap-md py-md rounded-xl hover-bg-error-soft text-error transition-all font-bold">
          <LogOut size={20} />
          <span>توقيع الخروج</span>
        </button>
      </div>
    </aside>
  );
}
