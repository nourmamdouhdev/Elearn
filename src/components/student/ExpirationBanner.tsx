"use client";

import { useState, useEffect } from "react";
import { Clock, AlertTriangle, Timer } from "lucide-react";

interface ExpirationBannerProps {
  expiresAt: string; // ISO date string (serialized from server)
}

export function ExpirationBanner({ expiresAt }: ExpirationBannerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        total: diff,
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!timeLeft) return null;

  // Determine urgency level
  const daysLeft = timeLeft.days;
  const isExpired = timeLeft.total <= 0;
  const isCritical = !isExpired && daysLeft < 1;
  const isWarning = !isExpired && !isCritical && daysLeft < 7;

  // Styling based on urgency
  const bgColor = isExpired
    ? "rgba(255, 107, 107, 0.1)"
    : isCritical
    ? "rgba(255, 107, 107, 0.08)"
    : isWarning
    ? "rgba(255, 185, 70, 0.08)"
    : "rgba(0, 212, 170, 0.06)";

  const borderColor = isExpired
    ? "var(--error)"
    : isCritical
    ? "var(--error)"
    : isWarning
    ? "var(--warning)"
    : "var(--success)";

  const textColor = isExpired
    ? "var(--error)"
    : isCritical
    ? "var(--error)"
    : isWarning
    ? "var(--warning)"
    : "var(--success)";

  const IconComponent = isExpired || isCritical ? AlertTriangle : isWarning ? Timer : Clock;

  if (isExpired) {
    return (
      <div
        className="flex items-center gap-md p-md rounded-xl"
        style={{ background: bgColor, border: `1px solid ${borderColor}` }}
      >
        <AlertTriangle size={20} style={{ color: textColor, flexShrink: 0 }} />
        <p className="text-sm" style={{ fontWeight: 600, color: textColor }}>
          انتهت صلاحية الوصول لهذه الحصة. يرجى إعادة الشراء لمتابعة المشاهدة.
        </p>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className="flex items-center justify-between p-md rounded-xl"
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        animation: isCritical ? "pulse 2s ease-in-out infinite" : undefined,
      }}
    >
      <div className="flex items-center gap-sm">
        <IconComponent size={18} style={{ color: textColor, flexShrink: 0 }} />
        <span className="text-sm" style={{ fontWeight: 600, color: textColor }}>
          {isCritical ? "⚠️ ينتهي الوصول قريباً!" : isWarning ? "صلاحية الوصول محدودة" : "صلاحية الوصول"}
        </span>
      </div>

      <div className="flex items-center gap-sm">
        {daysLeft > 0 && (
          <div className="flex items-center gap-xs">
            <span
              className="font-bold"
              style={{
                fontSize: "1rem",
                color: textColor,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {timeLeft.days}
            </span>
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>يوم</span>
          </div>
        )}
        <div className="flex items-center gap-xs">
          <span
            className="font-bold"
            style={{
              fontSize: "1rem",
              color: textColor,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
          </span>
          {daysLeft === 0 && (
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>متبقي</span>
          )}
        </div>
      </div>
    </div>
  );
}
