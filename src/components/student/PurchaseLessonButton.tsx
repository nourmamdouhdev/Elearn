"use client";

import { useState } from "react";
import { ShoppingCart, Loader2, CheckCircle2, AlertTriangle, X, Wallet } from "lucide-react";

interface PurchaseLessonButtonProps {
  lessonId: string;
  lessonTitle: string;
  price: number;
  walletBalance: number;
}

export function PurchaseLessonButton({ lessonId, lessonTitle, price, walletBalance }: PurchaseLessonButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canAfford = walletBalance >= price;

  const handlePurchase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء الشراء");
        return;
      }

      setSuccess(true);
      // Reload after a short delay so the user sees the success state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <button className="btn btn-sm" style={{ background: "var(--success)", color: "white", pointerEvents: "none" }}>
        <CheckCircle2 size={16} /> تم الشراء بنجاح!
      </button>
    );
  }

  return (
    <>
      <button onClick={() => setShowConfirm(true)} className="btn btn-outline btn-sm">
        <ShoppingCart size={16} /> شراء الحصة
      </button>

      {/* Confirmation Modal Overlay */}
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
              maxWidth: 420,
              padding: "var(--space-xl)",
              boxShadow: "var(--shadow-xl)",
              border: "1px solid var(--border-color)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <h3 style={{ fontSize: "1.15rem" }}>تأكيد الشراء</h3>
              <button
                onClick={() => { setShowConfirm(false); setError(null); }}
                className="btn btn-ghost btn-icon"
                style={{ padding: "var(--space-xs)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Lesson Info */}
            <div
              className="flex-col gap-sm p-md rounded-xl"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
            >
              <p style={{ fontWeight: 700, fontSize: "1rem" }}>{lessonTitle}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>سعر الحصة</span>
                <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--primary)" }}>
                  {price} ج.م
                </span>
              </div>
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
                  رصيدك غير كافٍ. يرجى شحن المحفظة بمبلغ {(price - walletBalance).toFixed(2)} ج.م على الأقل.
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-sm p-sm rounded-lg" style={{ background: "rgba(255, 107, 107, 0.08)" }}>
                <AlertTriangle size={16} style={{ color: "var(--error)", flexShrink: 0 }} />
                <p className="text-sm" style={{ color: "var(--error)" }}>{error}</p>
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
                onClick={handlePurchase}
                disabled={isLoading || !canAfford}
                className="btn btn-primary btn-sm"
                style={{ minWidth: 140 }}
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> جاري الشراء...</>
                ) : (
                  <><ShoppingCart size={16} /> تأكيد الشراء</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
