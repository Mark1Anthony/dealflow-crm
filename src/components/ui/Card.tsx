import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/5 bg-[#111218]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
