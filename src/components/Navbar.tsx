"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { GraduationCap, Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavbarAuth } from "@/components/NavbarAuth";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between" style={{ maxWidth: 1200 }}>
        <Link href="/" className="navbar-brand" id="navbar-logo">
          <GraduationCap size={28} style={{ color: "var(--primary)" }} />
          <span className="text-gradient">ELearn</span>
        </Link>

        <ul className="navbar-nav">
          <li><Link href="/" className="navbar-link">الرئيسية</Link></li>
          <li><Link href="/teachers" className="navbar-link">المدرسين</Link></li>
          <NavbarAuth />
          <li>
            <button
              onClick={toggleTheme}
              className="btn btn-icon btn-ghost"
              aria-label="تبديل الثيم"
              id="theme-toggle"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </li>
        </ul>

        {/* Mobile toggle */}
        <div className="flex items-center gap-sm" style={{ display: "none" }}>
          <button onClick={toggleTheme} className="btn btn-icon btn-ghost">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn btn-icon btn-ghost"
            aria-label="القائمة"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: "absolute",
          top: "var(--header-height)",
          left: 0,
          right: 0,
          background: "var(--bg-primary)",
          borderBottom: "1px solid var(--border-color)",
          padding: "var(--space-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-md)",
          animation: "slideDown 0.3s ease",
        }}>
          <Link href="/" className="navbar-link" onClick={() => setMobileOpen(false)}>الرئيسية</Link>
          <Link href="/teachers" className="navbar-link" onClick={() => setMobileOpen(false)}>المدرسين</Link>
          <Link href="/auth/login" className="navbar-link" onClick={() => setMobileOpen(false)}>تسجيل الدخول</Link>
          <Link href="/auth/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>ابدأ مجاناً</Link>
        </div>
      )}
    </nav>
  );
}
