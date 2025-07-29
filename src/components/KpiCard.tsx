import React from "react";
import { motion } from "framer-motion";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "primary" | "success" | "warning" | "danger";
  description?: string;
  deviation?: number;
  riskLevel?: "low" | "medium" | "high";
}

const colorMap = {
  primary: "from-blue-500 to-blue-700",
  success: "from-green-500 to-green-700",
  warning: "from-yellow-400 to-yellow-600",
  danger: "from-red-500 to-red-700",
};

const riskMap = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-red-600",
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  color,
  description,
  deviation,
  riskLevel,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`relative rounded-xl p-5 shadow-lg bg-gradient-to-br ${colorMap[color]} text-white overflow-hidden group hover:scale-105 transition-transform`}
  >
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs font-semibold uppercase opacity-80 mb-1">{title}</div>
        <div className="text-3xl font-bold">{value}</div>
        {deviation !== undefined && (
          <div className={`mt-1 text-sm font-medium ${deviation > 0 ? "text-red-200" : "text-green-200"}`}>
            {deviation > 0 ? "+" : ""}{deviation}% deviation
          </div>
        )}
        {riskLevel && (
          <div className={`mt-1 text-xs font-bold ${riskMap[riskLevel]}`}>{riskLevel.toUpperCase()} RISK</div>
        )}
        {description && (
          <div className="mt-1 text-xs opacity-70">{description}</div>
        )}
      </div>
      <div className="text-5xl opacity-30 group-hover:opacity-60 transition-opacity">
        {icon}
      </div>
    </div>
  </motion.div>
);
