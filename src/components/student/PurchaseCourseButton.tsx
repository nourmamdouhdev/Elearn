"use client";

import { useState } from "react";
import { ShoppingCart, Loader2, CheckCircle2, AlertTriangle, X, Wallet, Package } from "lucide-react";

interface LessonInfo {
  id: string;
  title: string;
  price: number;
  isFree: boolean;
}

interface PurchaseCourseButtonProps {
  courseTitle: string;
  lessons: LessonInfo[];
  purchasedLessonIds: string[];
  walletBalance: number;
}

export function PurchaseCourseButton({
  courseTitle,
  lessons,
  purchasedLessonIds,
  walletBalance,
}: PurchaseCourseButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [success, setSuccess] = useState(false);

  // Filter to only unpurchased, non-free lessons
  const lessonsToBuy = lessons.filter(
    (l) => !l.isFree && !purchasedLessonIds.includes(l.id)
  );
  const totalCost = lessonsToBuy.reduce((sum, l) => sum + l.price, 0);
  const canAfford = walletBalance >= totalCost;

  if (lessonsToBuy.length === 0) {
    return (
      <button className="btn btn-primary btn-lg" disabled style={{ opacity: 0.6 }}>
        <CheckCircle2 size={20} /> تم شراء جميع الحصص
      </button>
    );
  }

  const handleBulkPurchase = async () => {
    setIsLoading(true);
    setError(null);
    setProgress({ done: 0, total: lessonsToBuy.length });

    let purchased = 0;
    const errors: string[] = [];

    for (const lesson of lessonsToBuy) {
      try {
        const res = await fetch("/api/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId: lesson.id }),
        });

        const data = await res.json();
        if (!res.ok) {
          errors.push(`${lesson.title}: ${data.error}`);
        } else {
          purchased++;
        }
      } catch {
        errors.push(`${lesson.title}: خطأ في الاتصال`);
      }
      setProgress({ done: purchased + errors.length, total: lessonsToBuy.length });
    }

    setIsLoading(false);

    if (errors.length > 0 && purchased === 0) {
      setError(errors[0]);
    } else if (errors.length > 0) {
      setError(`تم شراء ${purchased} حصة، فشل ${errors.length}`);
    } else {
      setSuccess(true);
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  if (success) {
    return (
      <button className="btn btn-lg" style={{ background: "var(--success)", color: "white", pointerEvents: "none" }}>
        <CheckCircle2 size={20} /> تم شراء الكورس بنجاح!
      </button>
    );
  }

  return (
    <>
      <button onClick={() => setShowConfirm(true)} className="btn btn-primary btn-lg">
        <ShoppingCart size={20} /> شراء الكورس كاملاً
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            zIndex: 9999,
            background: "var(--bg-overlay)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false); }}
        >
          <div
            className="card flex-col gap-lg animate-fade-in"
            style={{
              width: "100%",
              maxWidth: 480,
              padding: "var(--space-xl)",
              boxShadow: "var(--shadow-xl)",
              border: "1px solid var(--border-color)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <h3 style={{ fontSize: "1.15rem" }}>
                <Package size={20} style={{ display: "inline", verticalAlign: "middle", marginLeft: 6 }} />
                شراء الكورس كاملاً
              </h3>
              <button
                onClick={() => { setShowConfirm(false); setError(null); }}
                className="btn btn-ghost btn-icon"
                style={{ padding: "var(--space-xs)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Course Info */}
            <div
              className="flex-col gap-sm p-md rounded-xl"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
            >
              <p style={{ fontWeight: 700, fontSize: "1rem" }}>{courseTitle}</p>
              <div className="flex justify-between items-center text-sm" style={{ color: "var(--text-secondary)" }}>
                <span>{lessonsToBuy.length} حصة سيتم شراؤها</span>
                <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--primary)" }}>
                  {totalCost} ج.م
                </span>
              </div>
            </div>

            {/* Lessons list */}
            <div
              className="flex-col gap-xs"
              style={{ maxHeight: 200, overflowY: "auto", paddingRight: 4 }}
            >
              {lessonsToBuy.map((l) => (
                <div
                  key={l.id}
                  className="flex justify-between items-center p-sm rounded-lg"
                  style={{ background: "var(--bg-secondary)", fontSize: "0.85rem" }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>{l.title}</span>
                  <span style={{ fontWeight: 600 }}>{l.price} ج.م</span>
                </div>
              ))}
            </div>

            {/* Wallet Balance */}
            <div
              className="flex items-center justify-between p-md rounded-xl"
              style={{
                background: canAfford ? "rgba(0, 212, 170, 0.08)" : "rgba(255, 107, 107, 0.08)",
                border: `1px solid ${canAfford ? "var(--success)" : "var(--error)"}`,
              }}
            >
              <div className="flex items-center gap-sm">
                <Wallet size={18} style={{ color: canAfford ? "var(--success)" : "var(--error)" }} />
                <span className="text-sm" style={{ fontWeight: 600 }}>رصيد المحفظة</span>
              </div>
              <span style={{ fontWeight: 800, color: canAfford ? "var(--success)" : "var(--error)" }}>
                {walletBalance.toFixed(2)} ج.م
              </span>
            </div>

            {!canAfford && (
              <div className="flex items-center gap-sm p-sm rounded-lg" style={{ background: "rgba(255, 107, 107, 0.08)" }}>
                <AlertTriangle size={16} style={{ color: "var(--error)", flexShrink: 0 }} />
                <p className="text-sm" style={{ color: "var(--error)" }}>
                  رصيدك غير كافٍ. يرجى شحن المحفظة بمبلغ {(totalCost - walletBalance).toFixed(2)} ج.م على الأقل.
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-sm p-sm rounded-lg" style={{ background: "rgba(255, 107, 107, 0.08)" }}>
                <AlertTriangle size={16} style={{ color: "var(--error)", flexShrink: 0 }} />
                <p className="text-sm" style={{ color: "var(--error)" }}>{error}</p>
              </div>
            )}

            {/* Progress bar during purchase */}
            {isLoading && (
              <div className="flex-col gap-xs">
                <div className="flex justify-between text-xs text-secondary">
                  <span>جاري شراء الحصص...</span>
                  <span>{progress.done} / {progress.total}</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 6,
                    borderRadius: 99,
                    background: "var(--bg-tertiary)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(progress.done / progress.total) * 100}%`,
                      background: "var(--primary)",
                      borderRadius: 99,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-md justify-end mt-sm">
              <button
                onClick={() => { setShowConfirm(false); setError(null); }}
                className="btn btn-secondary btn-sm"
                disabled={isLoading}
              >
                إلغاء
              </button>
              <button
                onClick={handleBulkPurchase}
                disabled={isLoading || !canAfford}
                className="btn btn-primary btn-sm"
                style={{ minWidth: 160 }}
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> جاري الشراء...</>
                ) : (
                  <><ShoppingCart size={16} /> شراء {lessonsToBuy.length} حصة — {totalCost} ج.م</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
