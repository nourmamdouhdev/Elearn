"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, GraduationCap, BookOpen } from "lucide-react";

type UserType = "student" | "teacher";
type Grade = "FIRST" | "SECOND" | "THIRD";

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Shared fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Student fields
  const [gender, setGender] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [school, setSchool] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState<Grade>("FIRST");

  // Teacher fields
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      setLoading(false);
      return;
    }

    const body = userType === "student"
      ? {
          type: "student",
          fullName, email, password, confirmPassword, phone,
          gender: gender || undefined,
          parentPhone, school,
          age: age ? parseInt(age) : undefined,
          grade,
        }
      : {
          type: "teacher",
          fullName, email, password, confirmPassword, phone,
          specialization, bio, qualifications,
        };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setFieldErrors(data.details);
        }
        setError(data.error || "حدث خطأ");
        setLoading(false);
        return;
      }

      // Success — redirect to login
      router.push("/auth/login?registered=true");
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (field: string) => {
    return fieldErrors[field]?.[0];
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-container" style={{ maxWidth: 520 }}>
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="text-gradient">
                <GraduationCap size={36} style={{ display: "inline", verticalAlign: "middle", marginLeft: "8px" }} />
                ELearn
              </span>
            </div>
            <p className="auth-subtitle">إنشاء حساب جديد على منصة ELearn</p>
          </div>

          {/* User Type Tabs */}
          <div className="tabs mb-lg">
            <button
              type="button"
              className={`tab ${userType === "student" ? "active" : ""}`}
              onClick={() => setUserType("student")}
              id="tab-student"
            >
              <GraduationCap size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "4px" }} />
              طالب
            </button>
            <button
              type="button"
              className={`tab ${userType === "teacher" ? "active" : ""}`}
              onClick={() => setUserType("teacher")}
              id="tab-teacher"
            >
              <BookOpen size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "4px" }} />
              مدرس
            </button>
          </div>

          {error && (
            <div className="toast toast-error mb-md" style={{ animation: "slideDown 0.3s ease", minWidth: "auto", width: "100%" }}>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">الاسم الكامل *</label>
              <input
                id="reg-name"
                type="text"
                className={`form-input ${getFieldError("fullName") ? "error" : ""}`}
                placeholder="أدخل اسمك الكامل"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              {getFieldError("fullName") && <span className="form-error">{getFieldError("fullName")}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">البريد الإلكتروني *</label>
              <input
                id="reg-email"
                type="email"
                className={`form-input ${getFieldError("email") ? "error" : ""}`}
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                style={{ textAlign: "right" }}
              />
              {getFieldError("email") && <span className="form-error">{getFieldError("email")}</span>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">رقم الهاتف</label>
              <input
                id="reg-phone"
                type="tel"
                className="form-input"
                placeholder="01xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                style={{ textAlign: "right" }}
              />
            </div>

            {/* Student-specific fields */}
            {userType === "student" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-gender">النوع</label>
                    <select
                      id="reg-gender"
                      className="form-input form-select"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="">اختر</option>
                      <option value="MALE">ذكر</option>
                      <option value="FEMALE">أنثى</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-age">العمر</label>
                    <input
                      id="reg-age"
                      type="number"
                      className="form-input"
                      placeholder="17"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      min={14}
                      max={25}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-grade">الصف الدراسي *</label>
                  <select
                    id="reg-grade"
                    className="form-input form-select"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as Grade)}
                    required
                  >
                    <option value="FIRST">الصف الأول الثانوي</option>
                    <option value="SECOND">الصف الثاني الثانوي</option>
                    <option value="THIRD">الصف الثالث الثانوي</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-parent-phone">رقم ولي الأمر</label>
                  <input
                    id="reg-parent-phone"
                    type="tel"
                    className="form-input"
                    placeholder="01xxxxxxxxx"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    dir="ltr"
                    style={{ textAlign: "right" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-school">المدرسة / الجامعة</label>
                  <input
                    id="reg-school"
                    type="text"
                    className="form-input"
                    placeholder="اسم المدرسة"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Teacher-specific fields */}
            {userType === "teacher" && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-specialization">التخصص</label>
                  <input
                    id="reg-specialization"
                    type="text"
                    className="form-input"
                    placeholder="مثال: رياضيات، فيزياء"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-qualifications">المؤهلات</label>
                  <input
                    id="reg-qualifications"
                    type="text"
                    className="form-input"
                    placeholder="الشهادات والخبرات"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-bio">نبذة شخصية</label>
                  <textarea
                    id="reg-bio"
                    className="form-input"
                    placeholder="أخبرنا عن نفسك وخبرتك في التدريس"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    style={{ resize: "vertical" }}
                  />
                </div>
              </>
            )}

            {/* Password fields */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">كلمة المرور *</label>
              <div className="password-wrapper">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  className={`form-input ${getFieldError("password") ? "error" : ""}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "إخفاء" : "إظهار"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {getFieldError("password") && <span className="form-error">{getFieldError("password")}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">تأكيد كلمة المرور *</label>
              <input
                id="reg-confirm"
                type="password"
                className={`form-input ${getFieldError("confirmPassword") ? "error" : ""}`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                dir="ltr"
                style={{ textAlign: "right" }}
              />
              {getFieldError("confirmPassword") && <span className="form-error">{getFieldError("confirmPassword")}</span>}
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg w-full mt-sm ${loading ? "btn-loading" : ""}`}
              disabled={loading}
              id="register-submit"
            >
              {loading ? "جاري إنشاء الحساب..." : (
                <>
                  <UserPlus size={20} />
                  إنشاء حساب {userType === "student" ? "طالب" : "مدرس"}
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            لديك حساب بالفعل؟{" "}
            <Link href="/auth/login">تسجيل الدخول</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
