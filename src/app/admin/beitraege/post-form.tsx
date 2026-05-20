"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { savePostAction, type PostFormState } from "./actions";

type PostInitial = {
  id?: number;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  cover_image?: string | null;
  published_at?: string;
};

const initialState: PostFormState = { status: "idle" };

export function PostForm({ initial }: { initial?: PostInitial }) {
  const [state, formAction, pending] = useActionState(savePostAction, initialState);
  const [removeCover, setRemoveCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
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
            Slug <span className="text-neutral-400">(optional, aus Titel generiert)</span>
          </label>
          <input
            id="slug"
            name="slug"
            className="input mt-2"
            defaultValue={initial?.slug ?? ""}
          />
        </div>
        <div>
          <label className="label" htmlFor="published_at">
            Datum
          </label>
          <input
            id="published_at"
            name="published_at"
            type="date"
            required
            className="input mt-2"
            defaultValue={initial?.published_at ?? new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="excerpt">
          Kurzbeschreibung <span className="text-neutral-400">(optional)</span>
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          className="input mt-2 resize-y"
          defaultValue={initial?.excerpt ?? ""}
        />
      </div>

      <div>
        <label className="label">Titelbild</label>
        {(coverPreview || (initial?.cover_image && !removeCover)) && (
          <div className="mt-3 relative h-48 w-full max-w-md overflow-hidden border border-neutral-200 bg-neutral-100">
            <Image
              src={coverPreview ?? initial!.cover_image!}
              alt="Cover"
              fill
              className="object-cover"
              unoptimized={Boolean(coverPreview)}
            />
          </div>
        )}
        <input
          type="file"
          name="cover"
          accept="image/*"
          className="mt-3 block text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setCoverPreview(URL.createObjectURL(f));
              setRemoveCover(false);
            }
          }}
        />
        {initial?.cover_image && (
          <label className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              name="remove_cover"
              value="1"
              checked={removeCover}
              onChange={(e) => setRemoveCover(e.target.checked)}
            />
            Titelbild entfernen
          </label>
        )}
      </div>

      <div>
        <label className="label" htmlFor="content">
          Inhalt <span className="text-neutral-400">(Markdown)</span>
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={18}
          className="input mt-2 resize-y font-mono text-sm"
          defaultValue={initial?.content ?? ""}
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-racing">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          {pending ? "Speichert …" : "Speichern"}
        </button>
        <Link href="/admin/beitraege" className="btn-ghost">
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
