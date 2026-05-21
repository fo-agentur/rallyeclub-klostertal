import { connection } from "next/server";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { ImportForm } from "./import-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Legacy-Inhalte importieren",
  robots: { index: false, follow: false },
};

export default async function AdminImportPage() {
  await connection();
  if (!(await isAuthenticated())) redirect("/admin");

  return (
    <div className="section">
      <div className="container-wide max-w-2xl">
        <div className="eyebrow">Admin</div>
        <h1 className="mt-2 font-display text-4xl tracking-wider text-ink">
          Legacy-Inhalte importieren
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600">
          Importiert die vorbereiteten Legacy-Daten aus der alten Joomla-Seite in die Datenbank:
          Beiträge, Alben, Fotos, Veranstaltungen, Personen, Sponsoren und Seitentexte. Wenn S3/MinIO
          konfiguriert ist, werden die Bilder unter dem Prefix{" "}
          <span className="font-mono text-xs text-neutral-800">legacy/</span> hochgeladen. Lokal kann
          der Import auch die vorhandenen Public-Bildpfade verwenden.
        </p>
        <ImportForm />
      </div>
    </div>
  );
}
