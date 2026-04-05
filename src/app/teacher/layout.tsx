import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell } from "lucide-react";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex dashboard-theme" style={{ minHeight: "100vh" }}>
      <TeacherSidebar />
      <main className="layout-main-content">
        {/* Header */}
        <header className="app-header">
          <div style={{ fontWeight: 800, color: "var(--secondary)", fontSize: "1.2rem" }}>بوابة المعلم</div>
          <div className="flex items-center gap-md">
            <ThemeToggle />
            <button className="btn btn-icon btn-ghost relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-card"></span>
            </button>
            <div className="divider-v" style={{ height: 24, width: 1, backgroundColor: "var(--border-color)" }}></div>
            <span className="badge badge-secondary font-bold">Teacher</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="dashboard-page">
          {children}
        </div>
      </main>
    </div>
  );
}
