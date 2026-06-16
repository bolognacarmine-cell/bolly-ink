import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  target?: "_blank" | "_self";
  rel?: string;
  ariaLabel?: string;
};

export function Button({
  href,
  onClick,
  children,
  variant = "primary",
  className,
  target,
  rel,
  ariaLabel,
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-60 disabled:pointer-events-none";

  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary:
      "bg-white text-black hover:bg-zinc-200 shadow-[0_0_0_1px_rgba(255,255,255,.15),0_14px_50px_-20px_rgba(255,255,255,.5)]",
    secondary:
      "bg-white/10 text-white hover:bg-white/15 shadow-[0_0_0_1px_rgba(255,255,255,.12)] backdrop-blur-md",
    ghost:
      "bg-transparent text-white hover:bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,.10)]",
  };

  const classes = cn(base, variants[variant], className);

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
