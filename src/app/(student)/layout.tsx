import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell } from "lucide-react";
import { auth } from "@/lib/auth";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userName = session?.user?.name || "طالب";
  const userInitial = userName[0] || "ط";

  return (
    <div className="flex dashboard-theme" style={{ minHeight: "100vh" }}>
      <StudentSidebar />
      <main className="layout-main-content">
        {/* Top Header */}
        <header className="app-header">
          <div style={{ fontWeight: 800, color: "var(--primary)", fontSize: "1.2rem" }}>بوابة الطالب</div>
          <div className="flex items-center gap-md">
            <ThemeToggle />
            <button className="btn btn-icon btn-ghost relative">
              <Bell size={20} />
            </button>
            <div style={{ height: 24, width: 1, backgroundColor: "var(--border-color)" }} />
            <div className="flex items-center gap-sm">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                }}
              >
                {userInitial}
              </div>
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{userName.split(" ")[0]}</span>
            </div>
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
