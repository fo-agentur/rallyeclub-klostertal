import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { REGLEMENT_MD } from "@/content/reglement";
import { getPageBySlug } from "@/lib/queries/pages";

export const metadata = {
  title: "Reglement",
  description: "Reglement der Vereinsmeisterschaft des Rallyeclub Klostertal.",
};

export default async function ReglementPage() {
  const page = await getPageBySlug("reglement");
  const title = page?.title ?? "Reglement";
  const body = page?.body ?? REGLEMENT_MD;

  return (
    <div className="section">
      <div className="container-prose">
        <div className="eyebrow">Vereinsmeisterschaft</div>
        <h1 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
          {title}
        </h1>
        <div className="prose-article mt-10">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
