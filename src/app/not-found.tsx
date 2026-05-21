import Link from "next/link";

export const metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="section">
      <div className="container-prose text-center">
        <div className="eyebrow">404</div>
        <h1 className="mt-3 font-display text-5xl uppercase leading-none tracking-wider text-ink md:text-7xl">
          Aus der Strecke
        </h1>
        <p className="mt-6 text-base leading-relaxed text-neutral-600">
          Diese Seite gibt es nicht — oder sie wurde verschoben. Zurück auf die Strecke geht es
          hier:
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            Zur Startseite
          </Link>
          <Link href="/news" className="btn-outline">
            Aktuelle News
          </Link>
          <Link href="/veranstaltungen" className="btn-outline">
            Termine
          </Link>
        </div>
      </div>
    </div>
  );
}
