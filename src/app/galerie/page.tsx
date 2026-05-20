import { SectionHeader } from "@/components/section-header";
import { AlbumGrid } from "@/components/album-grid";
import { listAlbums } from "@/lib/queries/albums";

export const metadata = {
  title: "Galerie",
  description: "Fotos aus den Veranstaltungen des Rallyeclub Klostertal.",
};

export default async function GalleryPage() {
  const albums = await listAlbums();

  return (
    <div className="section">
      <div className="container-wide">
        <SectionHeader
          eyebrow="Galerie"
          title="Alben"
          description="Impressionen aus den Veranstaltungen des Rallyeclub Klostertal — vom Autoslalom bis zum Gala-Abend."
        />
        <div className="mt-12">
          <AlbumGrid albums={albums} />
        </div>
      </div>
    </div>
  );
}
