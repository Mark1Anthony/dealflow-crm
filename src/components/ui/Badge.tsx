import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  cyan: "bg-cyan-500/15 text-cyan-400",
  green: "bg-green-500/15 text-green-400",
  red: "bg-red-500/15 text-red-400",
  yellow: "bg-yellow-500/15 text-yellow-400",
  purple: "bg-purple-500/15 text-purple-400",
  blue: "bg-blue-500/15 text-blue-400",
  orange: "bg-orange-500/15 text-orange-400",
  zinc: "bg-zinc-500/15 text-zinc-400",
};

interface BadgeProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export default function Badge({
  children,
  color = "cyan",
  className,
}: BadgeProps) {
  const colorClasses = colorMap[color];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        colorClasses,
        className,
      )}
      {...(!colorClasses && {
        style: {
          backgroundColor: `${color}20`,
          color: color,
        },
      })}
    >
      {children}
    </span>
  );
}
