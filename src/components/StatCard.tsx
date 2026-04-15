import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
  icon?: ReactNode;
}

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111218] p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        {icon && <div className="text-zinc-600">{icon}</div>}
      </div>

      <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">
        {value}
      </p>

      {change && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            changeType === "positive" && "text-green-400",
            changeType === "negative" && "text-red-400",
            !changeType && "text-zinc-500",
          )}
        >
          {change}
        </p>
      )}
    </div>
  );
}
