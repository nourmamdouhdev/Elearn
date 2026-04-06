"use client";

import { useState } from "react";
import { CreditCard, Plus, Loader2, Banknote } from "lucide-react";

const PRESET_AMOUNTS = [50, 100, 200, 500];

export function WalletTopup() {
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAmount = isCustom ? Number(customAmount) || 0 : amount;

  const handleStripeCheckout = async () => {
    if (selectedAmount < 50) {
      setError("الحد الأدنى للشحن 50 ج.م");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setIsLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
      setIsLoading(false);
    }
  };

  return (
    <div className="card flex-col gap-md justify-center py-xl px-xl">
      <h3 className="mb-xs">إضافة رصيد</h3>
      <p className="text-xs text-secondary mb-sm">اختر المبلغ المراد شحنه عبر Stripe</p>

      {/* Preset Amount Buttons */}
      <div className="grid grid-4 gap-sm">
        {PRESET_AMOUNTS.map((preset) => (
          <button
            key={preset}
            onClick={() => { setAmount(preset); setIsCustom(false); setError(null); }}
            className="flex-col items-center gap-xs p-md rounded-xl transition-all"
            style={{
              border: `2px solid ${!isCustom && amount === preset ? "var(--primary)" : "var(--border-color)"}`,
              background: !isCustom && amount === preset ? "rgba(108, 99, 255, 0.08)" : "var(--bg-secondary)",
              cursor: "pointer",
              fontWeight: 700,
              color: !isCustom && amount === preset ? "var(--primary)" : "var(--text-primary)",
            }}
          >
            <Banknote size={18} style={{ opacity: 0.6 }} />
            <span>{preset}</span>
            <span className="text-xs" style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>ج.م</span>
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="flex gap-sm items-center mt-xs">
        <button
          onClick={() => { setIsCustom(true); setError(null); }}
          className="text-xs"
          style={{
            color: isCustom ? "var(--primary)" : "var(--text-tertiary)",
            fontWeight: 600,
            background: "none",
            border: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          مبلغ آخر:
        </button>
        <input
          type="number"
          className="form-input"
          placeholder="أدخل المبلغ"
          value={customAmount}
          onChange={(e) => { setCustomAmount(e.target.value); setIsCustom(true); setError(null); }}
          min={50}
          max={10000}
          dir="ltr"
          style={{ fontSize: "0.9rem", padding: "0.5rem 0.75rem" }}
        />
      </div>

      {error && (
        <p className="text-sm" style={{ color: "var(--error)", fontWeight: 600 }}>{error}</p>
      )}

      {/* Stripe Pay Button */}
      <button
        onClick={handleStripeCheckout}
        disabled={isLoading || selectedAmount < 50}
        className="btn btn-primary w-full justify-between mt-sm"
        style={{ padding: "1rem" }}
      >
        <span className="flex items-center gap-sm">
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <CreditCard size={20} />
          )}
          {isLoading
            ? "جاري التحويل إلى Stripe..."
            : `دفع ${selectedAmount} ج.م عبر بطاقة بنكية`
          }
        </span>
        <Plus size={20} />
      </button>

      <p className="text-xs text-tertiary text-center mt-xs" style={{ opacity: 0.7 }}>
        🔒 الدفع آمن ومشفر عبر Stripe — نحن لا نحفظ بيانات بطاقتك
      </p>
    </div>
  );
}
