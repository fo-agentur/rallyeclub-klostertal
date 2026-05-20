import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPageBySlug } from "@/lib/queries/pages";

export const metadata = {
  title: "Reglement",
  description: "Reglement der Vereinsmeisterschaft des Rallyeclub Klostertal.",
};

export default async function ReglementPage() {
  const page = await getPageBySlug("reglement");

  return (
    <div className="section">
      <div className="container-prose">
        <div className="eyebrow">Vereinsmeisterschaft</div>
        <h1 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
          {page?.title ?? "Reglement"}
        </h1>
        <div className="prose-article mt-10">
          {page ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.body}</ReactMarkdown>
          ) : (
            <p>Das Reglement ist noch nicht in der Datenbank hinterlegt.</p>
          )}
        </div>
      </div>
    </div>
  );
}
