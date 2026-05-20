"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { savePersonAction, type PersonFormState } from "./actions";

type PersonInitial = {
  id?: number;
  name?: string;
  role?: string | null;
  group_label?: string;
  car?: string | null;
  photo?: string | null;
  driver_photo?: string | null;
  is_driver?: boolean;
  sort_order?: number;
};

const initialState: PersonFormState = { status: "idle" };

const GROUPS = ["Vorstand", "Ehrenmitglieder", "Mitglieder"];

export function PersonForm({ initial }: { initial?: PersonInitial }) {
  const [state, formAction, pending] = useActionState(savePersonAction, initialState);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [removeDriverPhoto, setRemoveDriverPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [driverPhotoPreview, setDriverPhotoPreview] = useState<string | null>(null);

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
          <label className="label" htmlFor="role">
            Funktion <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            id="role"
            name="role"
            className="input mt-2"
            defaultValue={initial?.role ?? ""}
          />
        </div>
        <div>
          <label className="label" htmlFor="group_label">
            Gruppe
          </label>
          <input
            id="group_label"
            name="group_label"
            required
            list="person-groups"
            className="input mt-2"
            defaultValue={initial?.group_label ?? "Mitglieder"}
          />
          <datalist id="person-groups">
            {GROUPS.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="car">
            Fahrzeug <span className="text-neutral-400">(nur aktive Fahrer)</span>
          </label>
          <input
            id="car"
            name="car"
            className="input mt-2"
            defaultValue={initial?.car ?? ""}
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

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="is_driver"
          value="1"
          defaultChecked={initial?.is_driver ?? false}
        />
        Auch als aktiver Fahrer anzeigen
      </label>

      <div>
        <label className="label">Foto</label>
        {(photoPreview || (initial?.photo && !removePhoto)) && (
          <div className="relative mt-3 h-56 w-44 overflow-hidden border border-neutral-200 bg-neutral-100">
            <Image
              src={photoPreview ?? initial!.photo!}
              alt="Person"
              fill
              className="object-cover"
              unoptimized={Boolean(photoPreview)}
            />
          </div>
        )}
        <input
          type="file"
          name="photo"
          accept="image/*"
          className="mt-3 block text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setPhotoPreview(URL.createObjectURL(f));
              setRemovePhoto(false);
            }
          }}
        />
        {initial?.photo && (
          <label className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              name="remove_photo"
              value="1"
              checked={removePhoto}
              onChange={(e) => setRemovePhoto(e.target.checked)}
            />
            Foto entfernen
          </label>
        )}
      </div>

      <div>
        <label className="label">Fahrerfoto</label>
        <p className="mt-1 text-xs text-neutral-500">
          Optionales Bild für die Seite "Aktive Fahrer"; wenn leer, wird das normale Foto verwendet.
        </p>
        {(driverPhotoPreview || (initial?.driver_photo && !removeDriverPhoto)) && (
          <div className="relative mt-3 h-56 w-44 overflow-hidden border border-neutral-200 bg-neutral-100">
            <Image
              src={driverPhotoPreview ?? initial!.driver_photo!}
              alt="Fahrerfoto"
              fill
              className="object-cover"
              unoptimized={Boolean(driverPhotoPreview)}
            />
          </div>
        )}
        <input
          type="file"
          name="driver_photo"
          accept="image/*"
          className="mt-3 block text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setDriverPhotoPreview(URL.createObjectURL(f));
              setRemoveDriverPhoto(false);
            }
          }}
        />
        {initial?.driver_photo && (
          <label className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              name="remove_driver_photo"
              value="1"
              checked={removeDriverPhoto}
              onChange={(e) => setRemoveDriverPhoto(e.target.checked)}
            />
            Fahrerfoto entfernen
          </label>
        )}
      </div>

      {state.status === "error" && <p className="text-sm text-racing">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          {pending ? "Speichert ..." : "Speichern"}
        </button>
        <Link href="/admin/personen" className="btn-ghost">
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
