"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveSponsorAction, type SponsorFormState } from "./actions";

type SponsorInitial = {
  id?: number;
  name?: string;
  tagline?: string | null;
  website?: string | null;
  logo?: string | null;
  sort_order?: number;
};

const initialState: SponsorFormState = { status: "idle" };

export function SponsorForm({ initial }: { initial?: SponsorInitial }) {
  const [state, formAction, pending] = useActionState(saveSponsorAction, initialState);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <div>
        <label className="label" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          className="input mt-2"
          defaultValue={initial?.name ?? ""}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="tagline">
            Zusatz <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            id="tagline"
            name="tagline"
            className="input mt-2"
            defaultValue={initial?.tagline ?? ""}
          />
        </div>
        <div>
          <label className="label" htmlFor="sort_order">
            Sortierung
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            min={0}
            className="input mt-2"
            defaultValue={initial?.sort_order ?? 0}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="website">
          Website <span className="text-neutral-400">(optional)</span>
        </label>
        <input
          id="website"
          name="website"
          type="url"
          className="input mt-2"
          defaultValue={initial?.website ?? ""}
        />
      </div>

      <div>
        <label className="label">Logo</label>
        {(logoPreview || (initial?.logo && !removeLogo)) && (
          <div className="relative mt-3 h-28 w-64 overflow-hidden border border-neutral-200 bg-neutral-100">
            <Image
              src={logoPreview ?? initial!.logo!}
              alt="Sponsor"
              fill
              className="object-contain p-3"
              unoptimized={Boolean(logoPreview)}
            />
          </div>
        )}
        <input
          type="file"
          name="logo"
          accept="image/*"
          className="mt-3 block text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setLogoPreview(URL.createObjectURL(f));
              setRemoveLogo(false);
            }
          }}
        />
        {initial?.logo && (
          <label className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              name="remove_logo"
              value="1"
              checked={removeLogo}
              onChange={(e) => setRemoveLogo(e.target.checked)}
            />
            Logo entfernen
          </label>
        )}
      </div>

      {state.status === "error" && <p className="text-sm text-racing">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          {pending ? "Speichert ..." : "Speichern"}
        </button>
        <Link href="/admin/sponsoren" className="btn-ghost">
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
