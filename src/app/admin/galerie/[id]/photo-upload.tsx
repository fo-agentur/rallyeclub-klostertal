"use client";

import { useRef, useState } from "react";
import { uploadPhotosAction } from "../actions";

export function PhotoUpload({ albumId }: { albumId: number }) {
  const [fileCount, setFileCount] = useState(0);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        setPending(true);
        try {
          await uploadPhotosAction(formData);
        } finally {
          setPending(false);
          setFileCount(0);
          formRef.current?.reset();
        }
      }}
      className="border border-dashed border-neutral-300 bg-white p-6"
    >
      <input type="hidden" name="album_id" value={albumId} />
      <label className="block cursor-pointer text-center">
        <input
          type="file"
          name="photos"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => setFileCount(e.target.files?.length ?? 0)}
        />
        <div className="font-display text-xl tracking-wider text-ink">
          Fotos hinzufügen
        </div>
        <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Mehrere Bilder gleichzeitig möglich
        </div>
        {fileCount > 0 && (
          <div className="mt-4 text-sm text-racing">{fileCount} Datei(en) ausgewählt</div>
        )}
      </label>
      {fileCount > 0 && (
        <div className="mt-4 flex justify-center">
          <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
            {pending ? "Lädt hoch …" : "Hochladen"}
          </button>
        </div>
      )}
    </form>
  );
}
