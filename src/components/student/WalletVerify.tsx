"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2 } from "lucide-react";

interface WalletVerifyProps {
  sessionId: string;
  amount: string;
}

export function WalletVerify({ sessionId, amount }: WalletVerifyProps) {
  const [status, setStatus] = useState<"verifying" | "success" | "already" | "error">("verifying");
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch("/api/wallet/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();

        if (data.success) {
          setStatus(data.alreadyProcessed ? "already" : "success");
          // Refresh the page data after a short delay so the balance updates
          setTimeout(() => router.refresh(), 1500);
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [sessionId, router]);

  if (status === "verifying") {
    return (
      <div
        className="flex items-center gap-md p-lg rounded-xl animate-fade-in"
        style={{ background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--primary)" }}
      >
        <div className="p-sm rounded-lg" style={{ background: "rgba(108, 99, 255, 0.15)" }}>
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <p style={{ fontWeight: 700, color: "var(--primary)" }}>جاري التحقق من الدفع...</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            يتم الآن تأكيد عملية الدفع وإضافة {amount} ج.م إلى رصيدك
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div
        className="flex items-center gap-md p-lg rounded-xl animate-fade-in"
        style={{ background: "rgba(0, 212, 170, 0.1)", border: "1px solid var(--success)" }}
      >
        <div className="p-sm rounded-lg" style={{ background: "rgba(0, 212, 170, 0.2)" }}>
          <ArrowUpRight size={24} style={{ color: "var(--success)" }} />
        </div>
        <div>
          <p style={{ fontWeight: 700, color: "var(--success)" }}>تم شحن المحفظة بنجاح! 🎉</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            تمت إضافة {amount} ج.م إلى رصيدك.
          </p>
        </div>
      </div>
    );
  }

  if (status === "already") {
    return (
      <div
        className="flex items-center gap-md p-lg rounded-xl animate-fade-in"
        style={{ background: "rgba(108, 99, 255, 0.08)", border: "1px solid var(--primary)" }}
      >
        <div className="p-sm rounded-lg" style={{ background: "rgba(108, 99, 255, 0.15)" }}>
          <ArrowUpRight size={24} style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <p style={{ fontWeight: 700, color: "var(--primary)" }}>تم تسجيل هذه العملية مسبقاً ✓</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            الرصيد محدث بالفعل.
          </p>
        </div>
      </div>
    );
  }

  // error
  return (
    <div
      className="flex items-center gap-md p-lg rounded-xl animate-fade-in"
      style={{ background: "rgba(255, 70, 70, 0.08)", border: "1px solid var(--error)" }}
    >
      <p style={{ fontWeight: 600, color: "var(--error)" }}>
        حدث خطأ أثناء التحقق من الدفع. يرجى التواصل مع الدعم.
      </p>
    </div>
  );
}
