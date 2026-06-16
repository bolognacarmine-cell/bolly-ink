import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  id?: string;
  className?: string;
  children: ReactNode;
};

export function Section({ id, className, children }: Props) {
  return (
    <section
      id={id}
      className={cn(
        "relative w-full py-20 sm:py-24 scroll-mt-20",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">{children}</div>
    </section>
  );
}

