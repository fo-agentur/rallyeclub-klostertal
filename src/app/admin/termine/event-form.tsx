"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveEventAction, type EventFormState } from "./actions";

type EventInitial = {
  id?: number;
  title?: string;
  date?: string;
  end_date?: string | null;
  location?: string | null;
  description?: string | null;
};

const initialState: EventFormState = { status: "idle" };

export function EventForm({ initial }: { initial?: EventInitial }) {
  const [state, formAction, pending] = useActionState(saveEventAction, initialState);

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
          <label className="label" htmlFor="date">
            Datum
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            className="input mt-2"
            defaultValue={initial?.date ?? ""}
          />
        </div>
        <div>
          <label className="label" htmlFor="end_date">
            Enddatum <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            className="input mt-2"
            defaultValue={initial?.end_date ?? ""}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="location">
          Ort
        </label>
        <input
          id="location"
          name="location"
          className="input mt-2"
          defaultValue={initial?.location ?? ""}
        />
      </div>

      <div>
        <label className="label" htmlFor="description">
          Beschreibung
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
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
        <Link href="/admin/termine" className="btn-ghost">
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
