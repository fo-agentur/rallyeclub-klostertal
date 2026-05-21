export const metadata = {
  title: "Impressum",
  description: "Impressum und Datenschutz des Rallyeclub Klostertal.",
};

export default function ImpressumPage() {
  return (
    <div className="section">
      <div className="container-prose">
        <div className="eyebrow">Rechtliches</div>
        <h1 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
          Impressum
        </h1>

        <div className="prose-article mt-10">
          <h2>Medieninhaber &amp; Herausgeber</h2>
          <p>
            Rallyeclub Klostertal (eingetragener Verein)
            <br />
            Vertretungsbefugter Obmann: Christoph Schuler
            <br />
            Amerdonastraße 22
            <br />
            6820 Frastanz
            <br />
            Österreich
          </p>
          <p>
            Telefon:{" "}
            <a href="tel:+436643512997">0664 / 35 12 997</a>
            <br />
            E-Mail:{" "}
            <a href="mailto:info@rallyeclub-klostertal.at">info@rallyeclub-klostertal.at</a>
          </p>
          <p>
            <strong>Vereinsbehörde:</strong> Bezirkshauptmannschaft Feldkirch
            <br />
            <strong>ZVR-Zahl:</strong> wird auf Anfrage übermittelt
          </p>

          <h2>Offenlegung gemäß § 25 Mediengesetz</h2>
          <p>
            <strong>Medieninhaber:</strong> Rallyeclub Klostertal, Amerdonastraße 22, 6820
            Frastanz, Österreich.
            <br />
            <strong>Blattlinie:</strong> Informationen über den Verein, seine Veranstaltungen
            (insbesondere den Autoslalom St. Gallenkirch), Aktivitäten der Mitglieder und
            Berichte aus dem Vereinsleben.
          </p>

          <h2>Vereinszweck</h2>
          <p>
            Förderung des Motorsports im Klostertal und Umgebung, Veranstaltung von
            Clubmeisterschaften, Geselligkeit und Austausch zwischen motorsport­begeisterten
            Mitgliedern.
          </p>

          <h2>Haftungsausschluss</h2>
          <p>
            Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die
            Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine
            Gewähr übernehmen. Als Diensteanbieter sind wir für eigene Inhalte auf diesen
            Seiten nach den allgemeinen Gesetzen verantwortlich.
          </p>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
            keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
            Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
            Anbieter oder Betreiber der Seiten verantwortlich.
          </p>

          <h2>Urheberrecht</h2>
          <p>
            Die durch den Rallyeclub Klostertal erstellten Inhalte und Werke auf dieser
            Website unterliegen dem österreichischen Urheberrecht. Die Vervielfältigung,
            Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des
            Urheberrechtes bedürfen der schriftlichen Zustimmung des Vereins.
          </p>

          <h2>Datenschutz</h2>
          <p>
            Details zur Verarbeitung personenbezogener Daten findest du in unserer{" "}
            <a href="/datenschutz">Datenschutzerklärung</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
