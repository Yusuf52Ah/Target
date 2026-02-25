import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800/90 bg-slate-900/80 p-5 shadow-[0_10px_50px_rgba(3,7,18,0.5)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
