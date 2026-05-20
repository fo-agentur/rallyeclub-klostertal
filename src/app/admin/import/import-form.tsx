"use client";

import Link from "next/link";
import { useActionState } from "react";
import { importLegacyAction, type ImportLegacyState } from "./actions";

const initial: ImportLegacyState = { status: "idle" };

export function ImportForm() {
  const [state, formAction, pending] = useActionState(
    async () => await importLegacyAction(),
    initial,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Achtung: der Import leert die folgenden Tabellen:</p>
        <p className="mt-1">
          <span className="font-mono text-xs">posts</span>,{" "}
          <span className="font-mono text-xs">albums</span>,{" "}
          <span className="font-mono text-xs">photos</span>,{" "}
          <span className="font-mono text-xs">events</span>,{" "}
          <span className="font-mono text-xs">people</span>,{" "}
          <span className="font-mono text-xs">sponsors</span>,{" "}
          <span className="font-mono text-xs">pages</span>
        </p>
        <p className="mt-2">
          Anschließend werden alle Legacy-Bilder aus dem Container nach MinIO/S3 hochgeladen und die
          Tabellen neu mit den S3-URLs befüllt. Das ist eine einmalige Aktion.
        </p>
      </div>

      {state.status === "error" && (
        <p className="rounded-md border border-racing/40 bg-racing/5 p-3 text-sm text-racing">
          {state.error}
        </p>
      )}

      {state.status === "success" && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Import erfolgreich.</p>
          <ul className="mt-2 grid grid-cols-2 gap-y-1 font-mono text-xs">
            <li>Hochgeladene Dateien</li>
            <li>{state.uploaded}</li>
            <li>Beiträge</li>
            <li>{state.posts}</li>
            <li>Alben</li>
            <li>{state.albums}</li>
            <li>Fotos</li>
            <li>{state.photos}</li>
            <li>Veranstaltungen</li>
            <li>{state.events}</li>
            <li>Personen</li>
            <li>{state.people}</li>
            <li>Sponsoren</li>
            <li>{state.sponsors}</li>
            <li>Texte</li>
            <li>{state.pages}</li>
            <li>Übersprungene Dateien</li>
            <li>{state.skipped}</li>
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          {pending ? "Importiere ..." : "Jetzt importieren"}
        </button>
        <Link href="/admin/dashboard" className="btn-ghost inline-flex items-center">
          ← Dashboard
        </Link>
      </div>
    </form>
  );
}
