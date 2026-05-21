"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error", error);
  }, [error]);

  return (
    <div className="section">
      <div className="container-prose text-center">
        <div className="eyebrow">Fehler</div>
        <h1 className="mt-3 font-display text-5xl uppercase leading-none tracking-wider text-ink md:text-7xl">
          Da ist etwas schief gelaufen
        </h1>
        <p className="mt-6 text-base leading-relaxed text-neutral-600">
          Die Seite konnte nicht geladen werden. Versuch es bitte erneut oder kehre zur
          Startseite zurück.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Erneut versuchen
          </button>
          <Link href="/" className="btn-outline">
            Zur Startseite
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-[10px] uppercase tracking-widest text-neutral-400">
            Fehler-Code: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
