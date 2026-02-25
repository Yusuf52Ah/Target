import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-emerald-400 text-slate-950 hover:bg-emerald-300 focus-visible:ring-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.45)]",
  secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:ring-slate-500 border border-slate-700",
  ghost: "bg-transparent text-slate-200 hover:bg-slate-800/70 focus-visible:ring-slate-500",
};

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
