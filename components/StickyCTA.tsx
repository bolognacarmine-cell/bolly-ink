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
          className="w-full sm:w-auto btn-primary"
          ariaLabel="Prenota subito su WhatsApp"
          style={{ fontSize: "1.08rem", fontWeight: 700, letterSpacing: "0.025em" }}
        >
          Prenota ora
        </Button>
        <Button href="#contatti" variant="secondary" className="hidden sm:inline-flex btn-secondary" ariaLabel="Apri la sezione contatti">
          Contatti
        </Button>
      </div>
    </div>
  );
}
