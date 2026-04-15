import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { REGLEMENT_MD } from "@/content/reglement";

export const metadata = {
  title: "Reglement",
  description: "Reglement der Vereinsmeisterschaft des Rallyeclub Klostertal.",
};

export default function ReglementPage() {
  return (
    <div className="section">
      <div className="container-prose">
        <div className="eyebrow">Vereinsmeisterschaft</div>
        <h1 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
          Reglement
        </h1>
        <div className="prose-article mt-10">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{REGLEMENT_MD}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
