"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, LogIn, LayoutDashboard } from "lucide-react";

interface NavUser {
  name: string;
  role: string;
}

export function NavbarAuth() {
  const [user, setUser] = useState<NavUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.name) {
          setUser({
            name: data.user.name,
            role: (data.user as any).role || "STUDENT",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <li style={{ width: 80 }}>
        <span className="navbar-link" style={{ opacity: 0.3 }}>...</span>
      </li>
    );
  }

  if (!user) {
    return (
      <>
        <li>
          <Link href="/auth/login" className="navbar-link">
            تسجيل الدخول
          </Link>
        </li>
        <li>
          <Link href="/auth/register" className="btn btn-primary btn-sm" id="navbar-register">
            ابدأ مجاناً
          </Link>
        </li>
      </>
    );
  }

  const dashboardHref =
    user.role === "ADMIN"
      ? "/admin/dashboard"
      : user.role === "TEACHER"
      ? "/teacher/dashboard"
      : "/dashboard";

  return (
    <>
      <li>
        <Link href={dashboardHref} className="btn btn-primary btn-sm flex items-center gap-xs" id="navbar-dashboard">
          <LayoutDashboard size={16} />
          لوحة التحكم
        </Link>
      </li>
      <li>
        <Link href="/profile" className="navbar-link flex items-center gap-xs">
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--primary)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 800,
            }}
          >
            {user.name[0]}
          </div>
          {user.name.split(" ")[0]}
        </Link>
      </li>
    </>
  );
}
