"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "./actions";

const initialState: ContactState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const values = state.status === "error" ? state.values : undefined;

  if (state.status === "success") {
    return (
      <div className="mt-8 border border-racing bg-white p-6 text-sm text-ink">
        <div className="eyebrow text-racing">Nachricht gesendet</div>
        <p className="mt-3 text-base">
          Danke für deine Nachricht. Wir melden uns so schnell wie möglich zurück.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label className="label" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="input mt-2"
          defaultValue={values?.name ?? ""}
        />
      </div>

      <div>
        <label className="label" htmlFor="email">
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input mt-2"
          defaultValue={values?.email ?? ""}
        />
      </div>

      <div>
        <label className="label" htmlFor="phone">
          Telefon <span className="text-neutral-400">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="input mt-2"
          defaultValue={values?.phone ?? ""}
        />
      </div>

      <div>
        <label className="label" htmlFor="body">
          Nachricht
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={6}
          className="input mt-2 resize-y"
          defaultValue={values?.body ?? ""}
        />
      </div>

      {state.status === "error" && state.error && (
        <p className="text-sm text-racing">{state.error}</p>
      )}

      <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
        {pending ? "Wird gesendet …" : "Nachricht senden"}
      </button>
    </form>
  );
}
