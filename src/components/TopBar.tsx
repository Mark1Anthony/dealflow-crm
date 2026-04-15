import { type ReactNode } from "react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function TopBar({ title, subtitle, action }: TopBarProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
