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
            Rallyeclub Klostertal
            <br />
            Obmann Christoph Schuler
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
            Die Nutzung unserer Website ist in der Regel ohne Angabe personenbezogener Daten
            möglich. Soweit auf unseren Seiten personenbezogene Daten (z.B. Name, E-Mail,
            Telefonnummer) erhoben werden, erfolgt dies, soweit möglich, stets auf
            freiwilliger Basis — etwa beim Absenden des Kontaktformulars.
          </p>
          <p>
            Über das Kontaktformular übermittelte Daten werden ausschließlich zur Bearbeitung
            der Anfrage gespeichert und nicht an Dritte weitergegeben. Es erfolgt keine
            automatisierte Weitergabe an Werbepartner.
          </p>
          <p>
            Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung und
            Einschränkung der Verarbeitung deiner gespeicherten Daten. Wende dich dafür an{" "}
            <a href="mailto:info@rallyeclub-klostertal.at">info@rallyeclub-klostertal.at</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
