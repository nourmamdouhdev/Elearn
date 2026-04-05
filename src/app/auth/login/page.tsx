"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, GraduationCap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="text-gradient">
                <GraduationCap size={36} style={{ display: "inline", verticalAlign: "middle", marginLeft: "8px" }} />
                ELearn
              </span>
            </div>
            <p className="auth-subtitle">مرحباً بعودتك! سجل دخولك للمتابعة</p>
          </div>

          {error && (
            <div className="toast toast-error mb-md" style={{ animation: "slideDown 0.3s ease" }}>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">البريد الإلكتروني</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                style={{ textAlign: "right" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">كلمة المرور</label>
              <div className="password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
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
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg w-full mt-sm ${loading ? "btn-loading" : ""}`}
              disabled={loading}
              id="login-submit"
            >
              {loading ? "جاري تسجيل الدخول..." : (
                <>
                  <LogIn size={20} />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            ليس لديك حساب؟{" "}
            <Link href="/auth/register">إنشاء حساب جديد</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
