import React from "react";

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ value, size = 56, stroke = 6, className = "" }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className={className}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.35em"
        fontSize={size * 0.32}
        fill="#222"
        fontWeight={700}
      >
        {progress}%
      </text>
    </svg>
  );
};
