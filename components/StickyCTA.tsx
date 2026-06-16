"use client";

import { Button } from "@/components/ui/Button";
import { site } from "@/data/site";

export function StickyCTA() {
  return (
    <div className="fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:right-4">
      <div className="flex flex-col gap-2">
        <Button
          href={site.contacts.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full shadow-[0_20px_80px_-45px_rgba(255,255,255,.45)] sm:w-auto"
        >
          Prenota ora
        </Button>
        <Button href="#contatti" variant="secondary" className="hidden sm:inline-flex">
          Contatti
        </Button>
      </div>
    </div>
  );
}
