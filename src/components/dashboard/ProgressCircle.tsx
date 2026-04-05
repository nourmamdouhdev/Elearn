"use client";

interface ProgressCircleProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function ProgressCircle({ 
  percent, 
  size = 120, 
  strokeWidth = 10, 
  color = "var(--primary)" 
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        {/* Background track */}
        <circle
          stroke="var(--bg-tertiary)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress bar */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset, transition: "stroke-dashoffset 1s ease-in-out" }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span style={{ fontSize: "1.5rem", fontWeight: 800 }}>{percent}%</span>
        <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase" }}>اكتمال</span>
      </div>
    </div>
  );
}
