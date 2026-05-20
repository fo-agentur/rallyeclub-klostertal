"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveAlbumAction, type AlbumFormState } from "./actions";

type AlbumInitial = {
  id?: number;
  title?: string;
  slug?: string;
  date?: string | null;
  description?: string | null;
};

const initialState: AlbumFormState = { status: "idle" };

export function AlbumForm({ initial }: { initial?: AlbumInitial }) {
  const [state, formAction, pending] = useActionState(saveAlbumAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <div>
        <label className="label" htmlFor="title">
          Titel
        </label>
        <input
          id="title"
          name="title"
          required
          className="input mt-2"
          defaultValue={initial?.title ?? ""}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="slug">
            Slug <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            id="slug"
            name="slug"
            className="input mt-2"
            defaultValue={initial?.slug ?? ""}
          />
        </div>
        <div>
          <label className="label" htmlFor="date">
            Datum <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            className="input mt-2"
            defaultValue={initial?.date ?? ""}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="description">
          Beschreibung
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="input mt-2 resize-y"
          defaultValue={initial?.description ?? ""}
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-racing">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          {pending ? "Speichert …" : "Speichern"}
        </button>
        <Link href="/admin/galerie" className="btn-ghost">
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
