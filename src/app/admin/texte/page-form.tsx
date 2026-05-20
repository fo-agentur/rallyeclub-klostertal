"use client";

import Link from "next/link";
import { useActionState } from "react";
import { savePageAction, type PageFormState } from "./actions";

type PageInitial = {
  slug: string;
  title: string;
  body: string;
};

const initialState: PageFormState = { status: "idle" };

export function PageForm({ initial }: { initial: PageInitial }) {
  const [state, formAction, pending] = useActionState(savePageAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="slug" value={initial.slug} />

      <div>
        <label className="label" htmlFor="title">
          Titel
        </label>
        <input
          id="title"
          name="title"
          required
          className="input mt-2"
          defaultValue={initial.title}
        />
      </div>

      <div>
        <label className="label" htmlFor="body">
          Inhalt <span className="text-neutral-400">(Markdown)</span>
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={22}
          className="input mt-2 resize-y font-mono text-sm"
          defaultValue={initial.body}
        />
      </div>

      {state.status === "error" && <p className="text-sm text-racing">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          {pending ? "Speichert ..." : "Speichern"}
        </button>
        <Link href="/admin/texte" className="btn-ghost">
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
