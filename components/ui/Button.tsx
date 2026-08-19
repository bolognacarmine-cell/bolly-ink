import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode, CSSProperties } from "react";

type Props = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  target?: "_blank" | "_self";
  rel?: string;
  ariaLabel?: string;
  disabled?: boolean;
  style?: CSSProperties;
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
  disabled = false,
  style,
}: Props) {
  const base =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 py-3.5 text-base sm:px-5 sm:py-3 text-center leading-none font-bold tracking-wide whitespace-nowrap transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/70 disabled:opacity-60 disabled:pointer-events-none";

  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary:
      "bg-accent-primary text-white hover:bg-accent-primary-darker shadow-[0_3px_26px_-7px_var(--accent-primary)]",
    secondary:
      "bg-transparent text-accent-primary border-2 border-accent-primary hover:bg-accent-primary hover:text-white shadow-none",
    ghost:
      "bg-transparent text-accent-primary hover:text-white hover:bg-accent-primary/20",
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
        style={style}
      >
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} aria-label={ariaLabel} style={style}>
      {children}
    </button>
  );
}
