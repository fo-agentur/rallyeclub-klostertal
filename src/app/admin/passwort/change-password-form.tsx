"use client";

import Link from "next/link";
import { useActionState } from "react";
import { changePasswordAction, type ChangePasswordState } from "./actions";

const initial: ChangePasswordState = { status: "idle" };

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initial);

  return (
    <form action={formAction} className="mt-8 max-w-md space-y-5">
      <div>
        <label className="label" htmlFor="currentPassword">
          Aktuelles Passwort
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="input mt-2"
        />
      </div>

      <div>
        <label className="label" htmlFor="newPassword">
          Neues Passwort
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="input mt-2"
        />
        <p className="mt-1 text-xs text-neutral-500">Mindestens 8 Zeichen.</p>
      </div>

      <div>
        <label className="label" htmlFor="confirmPassword">
          Neues Passwort wiederholen
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="input mt-2"
        />
      </div>

      {state.status === "error" && <p className="text-sm text-racing">{state.error}</p>}
      {state.status === "success" && (
        <p className="text-sm text-emerald-700">{state.message}</p>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          {pending ? "Speichern …" : "Passwort speichern"}
        </button>
        <Link href="/admin/dashboard" className="btn-ghost inline-flex items-center">
          ← Dashboard
        </Link>
      </div>
    </form>
  );
}
