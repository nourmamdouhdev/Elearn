import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  GraduationCap,
  Shield,
  Wallet,
  Video,
  BookOpen,
  Users,
  Star,
  ArrowLeft,
  Zap,
  Lock,
  TrendingUp,
  Award,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3xl)", alignItems: "center" }}>
          <div className="hero-content animate-fade-in-up">
            <div className="hero-badge">
              <Zap size={16} />
              منصة التعليم الأولى في مصر
            </div>

            <h1 className="hero-title">
              تعلّم بذكاء{" "}
              <span className="text-gradient">وانجح بتفوق</span>
            </h1>

            <p className="hero-description">
              منصة تعليمية متكاملة لطلاب الثانوية العامة. محتوى عالي الجودة من أفضل المدرسين في مصر، نظام دفع آمن، وحماية كاملة للمحتوى.
            </p>

            <div className="hero-actions">
              <Link href="/auth/register" className="btn btn-primary btn-lg" id="hero-cta-register">
                ابدأ مجاناً
                <ArrowLeft size={20} />
              </Link>
              <Link href="/courses" className="btn btn-outline btn-lg" id="hero-cta-browse">
                تصفح الدروس
              </Link>
            </div>

            <div className="hero-stats">
              <div className="animate-fade-in-up stagger-1">
                <div className="hero-stat-value text-gradient">+1000</div>
                <div className="hero-stat-label">درس متاح</div>
              </div>
              <div className="animate-fade-in-up stagger-2">
                <div className="hero-stat-value text-gradient">+50</div>
                <div className="hero-stat-label">مدرس متميز</div>
              </div>
              <div className="animate-fade-in-up stagger-3">
                <div className="hero-stat-value text-gradient">+5000</div>
                <div className="hero-stat-label">طالب مسجل</div>
              </div>
            </div>
          </div>

          <div className="hero-visual animate-fade-in-up stagger-2" style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
            {/* Floating Cards */}
            <div className="card card-glass animate-float" style={{ padding: "var(--space-xl)", maxWidth: 380, marginInlineStart: "auto" }}>
              <div className="flex items-center gap-md mb-md">
                <div className="feature-icon feature-icon-primary" style={{ width: 44, height: 44, borderRadius: "var(--radius-md)" }}>
                  <Video size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>دروس فيديو محمية</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>بتشفير AES-128</div>
                </div>
              </div>
              <div style={{ height: 6, background: "var(--bg-tertiary)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "75%", background: "linear-gradient(90deg, var(--primary), var(--secondary))", borderRadius: "var(--radius-full)" }} />
              </div>
            </div>

            <div className="card card-glass animate-float" style={{ padding: "var(--space-xl)", maxWidth: 320, animationDelay: "1s" }}>
              <div className="flex items-center gap-md">
                <div className="feature-icon feature-icon-secondary" style={{ width: 44, height: 44, borderRadius: "var(--radius-md)" }}>
                  <Wallet size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>محفظة إلكترونية</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>شحن وشراء بسهولة</div>
                </div>
              </div>
            </div>

            <div className="card card-glass animate-float" style={{ padding: "var(--space-xl)", maxWidth: 350, marginInlineStart: "auto", animationDelay: "2s" }}>
              <div className="flex items-center gap-md">
                <div className="avatar-placeholder avatar-lg" style={{ width: 44, height: 44, fontSize: "0.85rem", borderRadius: "var(--radius-md)" }}>
                  ⭐
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>أحمد حصل على 95%</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>في الرياضيات</div>
                </div>
                <div className="badge badge-success" style={{ marginInlineStart: "auto" }}>ممتاز</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div className="section-header">
            <div className="hero-badge mx-auto mb-md">
              <Star size={16} />
              لماذا ELearn؟
            </div>
            <h2 className="section-title">
              كل ما تحتاجه <span className="text-gradient">في مكان واحد</span>
            </h2>
            <p className="section-subtitle">
              نوفر لك أدوات تعليمية متطورة تساعدك على التفوق
            </p>
          </div>

          <div className="grid grid-3 gap-lg">
            <div className="feature-card animate-fade-in-up stagger-1">
              <div className="feature-icon feature-icon-primary">
                <BookOpen size={28} />
              </div>
              <h3 className="feature-title">دروس شاملة</h3>
              <p className="feature-description">
                محتوى تعليمي يغطي جميع المواد للصفوف الثلاثة الثانوية، مع شرح تفصيلي وتمارين تفاعلية.
              </p>
            </div>

            <div className="feature-card animate-fade-in-up stagger-2">
              <div className="feature-icon feature-icon-secondary">
                <Shield size={28} />
              </div>
              <h3 className="feature-title">حماية المحتوى</h3>
              <p className="feature-description">
                نظام تشفير متقدم يحمي الفيديوهات من النسخ والتحميل مع علامة مائية لكل طالب.
              </p>
            </div>

            <div className="feature-card animate-fade-in-up stagger-3">
              <div className="feature-icon feature-icon-accent">
                <Wallet size={28} />
              </div>
              <h3 className="feature-title">محفظة رقمية</h3>
              <p className="feature-description">
                اشحن رصيدك بسهولة عبر فوري أو البطاقات البنكية واشتري الدروس مباشرة.
              </p>
            </div>

            <div className="feature-card animate-fade-in-up stagger-4">
              <div className="feature-icon feature-icon-warning">
                <Video size={28} />
              </div>
              <h3 className="feature-title">فيديو عالي الجودة</h3>
              <p className="feature-description">
                بث متكيف مع سرعة الإنترنت لتجربة مشاهدة سلسة بجودات متعددة.
              </p>
            </div>

            <div className="feature-card animate-fade-in-up stagger-5">
              <div className="feature-icon feature-icon-primary">
                <Users size={28} />
              </div>
              <h3 className="feature-title">أفضل المدرسين</h3>
              <p className="feature-description">
                نخبة من أفضل المدرسين المعتمدين في مصر مع سجل حافل بالنجاح.
              </p>
            </div>

            <div className="feature-card animate-fade-in-up stagger-5">
              <div className="feature-icon feature-icon-secondary">
                <TrendingUp size={28} />
              </div>
              <h3 className="feature-title">تتبع التقدم</h3>
              <p className="feature-description">
                تابع تقدمك في كل مادة واحصل على تقارير مفصلة عن أدائك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              كيف <span className="text-gradient">تبدأ؟</span>
            </h2>
            <p className="section-subtitle">
              ثلاث خطوات بسيطة وتبدأ رحلة التفوق
            </p>
          </div>

          <div className="grid grid-3 gap-xl">
            <div className="text-center animate-fade-in-up stagger-1">
              <div className="feature-icon feature-icon-primary mx-auto" style={{ width: 72, height: 72, borderRadius: "50%", fontSize: "1.8rem", marginBottom: "var(--space-xl)" }}>
                1
              </div>
              <h3 style={{ marginBottom: "var(--space-sm)" }}>سجل حسابك</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                أنشئ حسابك مجاناً كطالب أو مدرس في أقل من دقيقة
              </p>
            </div>

            <div className="text-center animate-fade-in-up stagger-2">
              <div className="feature-icon feature-icon-secondary mx-auto" style={{ width: 72, height: 72, borderRadius: "50%", fontSize: "1.8rem", marginBottom: "var(--space-xl)" }}>
                2
              </div>
              <h3 style={{ marginBottom: "var(--space-sm)" }}>اشحن محفظتك</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                أضف رصيداً عبر فوري، كروت الشحن، أو الدفع الإلكتروني
              </p>
            </div>

            <div className="text-center animate-fade-in-up stagger-3">
              <div className="feature-icon feature-icon-accent mx-auto" style={{ width: 72, height: 72, borderRadius: "50%", fontSize: "1.8rem", marginBottom: "var(--space-xl)" }}>
                3
              </div>
              <h3 style={{ marginBottom: "var(--space-sm)" }}>ابدأ التعلم</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                اختر دروسك المفضلة وابدأ المشاهدة فوراً بجودة عالية
              </p>
            </div>
          </div>

          <div className="text-center mt-xl">
            <Link href="/auth/register" className="btn btn-primary btn-lg" id="cta-bottom-register">
              ابدأ الآن مجاناً
              <ArrowLeft size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* For Teachers Section */}
      <section className="section" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div className="section-header">
            <div className="hero-badge mx-auto mb-md">
              <Award size={16} />
              للمدرسين
            </div>
            <h2 className="section-title">
              انشر دروسك و<span className="text-gradient">اربح أكثر</span>
            </h2>
            <p className="section-subtitle">
              منصة متكاملة لإدارة المحتوى التعليمي وتحقيق دخل مستدام
            </p>
          </div>

          <div className="grid grid-2 gap-lg" style={{ maxWidth: 800, margin: "0 auto" }}>
            <div className="card card-interactive" style={{ padding: "var(--space-xl)" }}>
              <Lock size={24} style={{ color: "var(--primary)", marginBottom: "var(--space-md)" }} />
              <h4 style={{ marginBottom: "var(--space-sm)" }}>حماية كاملة</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>محتواك محمي بالكامل من النسخ والسرقة بأحدث تقنيات التشفير</p>
            </div>
            <div className="card card-interactive" style={{ padding: "var(--space-xl)" }}>
              <TrendingUp size={24} style={{ color: "var(--secondary)", marginBottom: "var(--space-md)" }} />
              <h4 style={{ marginBottom: "var(--space-sm)" }}>إحصائيات مفصلة</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>تابع أرباحك وعدد الطلاب المشتركين وتفاعلهم مع دروسك</p>
            </div>
            <div className="card card-interactive" style={{ padding: "var(--space-xl)" }}>
              <Wallet size={24} style={{ color: "var(--accent)", marginBottom: "var(--space-md)" }} />
              <h4 style={{ marginBottom: "var(--space-sm)" }}>أرباح فورية</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>استلم أرباحك مباشرة في محفظتك مع نسبة 80% من سعر الدرس</p>
            </div>
            <div className="card card-interactive" style={{ padding: "var(--space-xl)" }}>
              <GraduationCap size={24} style={{ color: "var(--warning)", marginBottom: "var(--space-md)" }} />
              <h4 style={{ marginBottom: "var(--space-sm)" }}>أدوات متقدمة</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>رفع فيديوهات وملفات PDF وتنظيم الدروس في كورسات متكاملة</p>
            </div>
          </div>

          <div className="text-center mt-xl">
            <Link href="/auth/register" className="btn btn-secondary btn-lg" id="cta-teacher-register">
              انضم كمدرس
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "var(--space-2xl)" }}>
            <div>
              <div className="auth-logo mb-md" style={{ fontSize: "1.5rem" }}>
                <span className="text-gradient">
                  <GraduationCap size={28} style={{ display: "inline", verticalAlign: "middle", marginLeft: "6px" }} />
                  ELearn
                </span>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: 300 }}>
                منصة التعليم الرائدة في مصر لطلاب الثانوية العامة. نساعد الطلاب على التفوق والمدرسين على النجاح.
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: "var(--space-md)", fontSize: "1rem" }}>روابط سريعة</h4>
              <div className="flex flex-col gap-sm">
                <Link href="/courses" style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>تصفح الدروس</Link>
                <Link href="/auth/register" style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>إنشاء حساب</Link>
                <Link href="/auth/login" style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>تسجيل الدخول</Link>
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: "var(--space-md)", fontSize: "1rem" }}>الدعم</h4>
              <div className="flex flex-col gap-sm">
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>الأسئلة الشائعة</span>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>تواصل معنا</span>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>سياسة الخصوصية</span>
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: "var(--space-md)", fontSize: "1rem" }}>تواصل معنا</h4>
              <div className="flex flex-col gap-sm">
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>info@elearn.com</span>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>01000000000</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            © {new Date().getFullYear()} ELearn. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </>
  );
}
