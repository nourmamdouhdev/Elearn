"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  User,
  Phone,
  School,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SettingsPage() {
  // Profile form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [school, setSchool] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [initialLoading, setInitialLoading] = useState(true);

  // Load current profile data
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then(async (session) => {
        if (session?.user?.name) {
          setFullName(session.user.name);
        }
        // Fetch full profile from a dedicated endpoint
        const profileRes = await fetch("/api/student/profile");
        if (profileRes.ok) {
          const data = await profileRes.json();
          setFullName(data.fullName || "");
          setPhone(data.phone || "");
          setParentPhone(data.parentPhone || "");
          setSchool(data.school || "");
        }
      })
      .catch(() => {})
      .finally(() => setInitialLoading(false));
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);

    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, parentPhone, school }),
      });

      const data = await res.json();
      if (res.ok) {
        setProfileMsg({ type: "success", text: "تم تحديث المعلومات بنجاح" });
      } else {
        setProfileMsg({ type: "error", text: data.error || "حدث خطأ" });
      }
    } catch {
      setProfileMsg({ type: "error", text: "حدث خطأ في الاتصال" });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "كلمة المرور الجديدة لا تتطابق" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" });
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch("/api/student/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: "success", text: "تم تغيير كلمة المرور بنجاح" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg({ type: "error", text: data.error || "حدث خطأ" });
      }
    } catch {
      setPasswordMsg({ type: "error", text: "حدث خطأ في الاتصال" });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-3xl">
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <div className="flex-col gap-xl animate-fade-in" style={{ maxWidth: 700, margin: "0 auto" }}>
      <div>
        <h1 className="mb-xs">الإعدادات</h1>
        <p style={{ color: "var(--text-secondary)" }}>تعديل بياناتك الشخصية وكلمة المرور</p>
      </div>

      {/* Personal Info Section */}
      <form onSubmit={handleProfileSave} className="card flex-col gap-lg">
        <h3 className="flex items-center gap-sm" style={{ marginBottom: 0 }}>
          <User size={20} style={{ color: "var(--primary)" }} />
          المعلومات الشخصية
        </h3>

        <div className="form-group">
          <label className="form-label" htmlFor="settings-name">الاسم الكامل</label>
          <input
            id="settings-name"
            type="text"
            className="form-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            minLength={2}
          />
        </div>

        <div className="grid grid-2 gap-md">
          <div className="form-group">
            <label className="form-label" htmlFor="settings-phone">
              <Phone size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: 4 }} />
              رقم الهاتف
            </label>
            <input
              id="settings-phone"
              type="tel"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              style={{ textAlign: "right" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="settings-parent-phone">
              <Phone size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: 4 }} />
              هاتف ولي الأمر
            </label>
            <input
              id="settings-parent-phone"
              type="tel"
              className="form-input"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              dir="ltr"
              style={{ textAlign: "right" }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="settings-school">
            <School size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: 4 }} />
            المدرسة
          </label>
          <input
            id="settings-school"
            type="text"
            className="form-input"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="اسم المدرسة"
          />
        </div>

        {profileMsg && (
          <div
            className="flex items-center gap-sm p-md rounded-xl"
            style={{
              background: profileMsg.type === "success" ? "rgba(0, 212, 170, 0.08)" : "rgba(255, 107, 107, 0.08)",
              border: `1px solid ${profileMsg.type === "success" ? "var(--success)" : "var(--error)"}`,
            }}
          >
            {profileMsg.type === "success" ? (
              <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
            ) : (
              <AlertTriangle size={18} style={{ color: "var(--error)" }} />
            )}
            <span
              style={{
                fontWeight: 600,
                color: profileMsg.type === "success" ? "var(--success)" : "var(--error)",
              }}
            >
              {profileMsg.text}
            </span>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary" disabled={profileLoading}>
            {profileLoading ? (
              <><Loader2 size={16} className="animate-spin" /> جاري الحفظ...</>
            ) : (
              <><Save size={16} /> حفظ التغييرات</>
            )}
          </button>
        </div>
      </form>

      {/* Password Section */}
      <form onSubmit={handlePasswordChange} className="card flex-col gap-lg">
        <h3 className="flex items-center gap-sm" style={{ marginBottom: 0 }}>
          <Lock size={20} style={{ color: "var(--primary)" }} />
          تغيير كلمة المرور
        </h3>

        <div className="form-group">
          <label className="form-label" htmlFor="settings-current-pass">كلمة المرور الحالية</label>
          <div className="password-wrapper">
            <input
              id="settings-current-pass"
              type={showCurrent ? "text" : "password"}
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              dir="ltr"
              style={{ textAlign: "right" }}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowCurrent(!showCurrent)}
              tabIndex={-1}
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="grid grid-2 gap-md">
          <div className="form-group">
            <label className="form-label" htmlFor="settings-new-pass">كلمة المرور الجديدة</label>
            <div className="password-wrapper">
              <input
                id="settings-new-pass"
                type={showNew ? "text" : "password"}
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                dir="ltr"
                style={{ textAlign: "right" }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowNew(!showNew)}
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="settings-confirm-pass">تأكيد كلمة المرور</label>
            <input
              id="settings-confirm-pass"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              dir="ltr"
              style={{ textAlign: "right" }}
            />
          </div>
        </div>

        {passwordMsg && (
          <div
            className="flex items-center gap-sm p-md rounded-xl"
            style={{
              background: passwordMsg.type === "success" ? "rgba(0, 212, 170, 0.08)" : "rgba(255, 107, 107, 0.08)",
              border: `1px solid ${passwordMsg.type === "success" ? "var(--success)" : "var(--error)"}`,
            }}
          >
            {passwordMsg.type === "success" ? (
              <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
            ) : (
              <AlertTriangle size={18} style={{ color: "var(--error)" }} />
            )}
            <span
              style={{
                fontWeight: 600,
                color: passwordMsg.type === "success" ? "var(--success)" : "var(--error)",
              }}
            >
              {passwordMsg.text}
            </span>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
            {passwordLoading ? (
              <><Loader2 size={16} className="animate-spin" /> جاري التغيير...</>
            ) : (
              <><Lock size={16} /> تغيير كلمة المرور</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
