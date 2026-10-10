"use client";

import type { ReactNode } from "react";
import { TwinPanel } from "@/components/twin-panel";
import { ButtonLink } from "@/components/ui/button";
import { useStoredTwin } from "@/lib/twin-store";

/**
 * Shows the twin panel and the page content once a twin exists, or a calm prompt to
 * create one. Renders nothing until the browser's storage has been read.
 */
export function TwinGate({ children }: { children: ReactNode }) {
  const [twin] = useStoredTwin();

  if (twin === undefined) return null;
  if (twin === null) {
    return (
      <section className="max-w-xl rounded-md border border-border bg-surface p-6">
        <h2 className="font-semibold tracking-tight">No twin yet</h2>
        <p className="mt-2 text-sm text-muted">
          Answer a few questions about yourself and your latest HbA1c, and GlucoTwin will set up a
          model of your glucose response. It takes about a minute and stays in this browser.
        </p>
        <ButtonLink href="/onboarding" className="mt-4">
          Create your twin
        </ButtonLink>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <TwinPanel twin={twin} />
      {children}
    </div>
  );
}
