"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type Photo = { id: number; url: string; caption: string | null };

export function AlbumLightbox({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(-1);

  return (
    <>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setIndex(i)}
            className="group relative aspect-[4/3] overflow-hidden bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-racing focus:ring-offset-2"
          >
            <Image
              src={photo.url}
              alt={photo.caption ?? ""}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            />
          </button>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={photos.map((p) => ({ src: p.url, description: p.caption ?? undefined }))}
        styles={{ container: { backgroundColor: "rgba(10, 10, 10, 0.95)" } }}
      />
    </>
  );
}
