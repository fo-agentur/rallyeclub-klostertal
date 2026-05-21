export const metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung des Rallyeclub Klostertal nach DSGVO.",
};

export default function DatenschutzPage() {
  return (
    <div className="section">
      <div className="container-prose">
        <div className="eyebrow">Rechtliches</div>
        <h1 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
          Datenschutz
        </h1>

        <div className="prose-article mt-10">
          <h2>Verantwortlicher</h2>
          <p>
            Rallyeclub Klostertal (eingetragener Verein)
            <br />
            Obmann Christoph Schuler
            <br />
            Amerdonastraße 22, 6820 Frastanz, Österreich
            <br />
            E-Mail:{" "}
            <a href="mailto:info@rallyeclub-klostertal.at">info@rallyeclub-klostertal.at</a>
            <br />
            Telefon: <a href="tel:+436643512997">0664 / 35 12 997</a>
          </p>

          <h2>Welche Daten verarbeitet werden</h2>
          <p>
            Die Nutzung unserer Website ist in der Regel ohne Angabe personenbezogener Daten
            möglich. Personenbezogene Daten werden nur erhoben, wenn du sie uns aktiv mitteilst
            — insbesondere über das Kontaktformular (Name, E-Mail, Nachricht) oder bei einer
            Anmeldung zu einer Vereinsveranstaltung.
          </p>

          <h2>Zweck und Rechtsgrundlage der Verarbeitung</h2>
          <ul>
            <li>
              <strong>Kontaktformular:</strong> Bearbeitung deiner Anfrage. Rechtsgrundlage:
              Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) bzw. lit. f (berechtigtes
              Interesse an der Kommunikation).
            </li>
            <li>
              <strong>Veranstaltungsanmeldung:</strong> Organisation und Abwicklung des
              Autoslaloms bzw. anderer Vereinstermine. Rechtsgrundlage: Art. 6 Abs. 1 lit. b
              DSGVO.
            </li>
            <li>
              <strong>Server-Logfiles (Hosting-Anbieter):</strong> IP-Adresse, abgerufene
              Seite, Zeitpunkt, User-Agent — zur Sicherstellung des Betriebs. Rechtsgrundlage:
              Art. 6 Abs. 1 lit. f DSGVO.
            </li>
          </ul>

          <h2>Auftragsverarbeiter &amp; Hosting</h2>
          <p>
            Für den Betrieb dieser Website setzen wir technische Dienstleister ein, die als
            Auftragsverarbeiter im Sinne der DSGVO tätig sind. Mit allen Auftragsverarbeitern
            bestehen entsprechende Verträge gemäß Art. 28 DSGVO.
          </p>
          <ul>
            <li>
              <strong>Hosting (Anwendung &amp; Datenbank):</strong> Coolify-Server, betrieben
              auf europäischer Infrastruktur. Server-Logfiles werden zur Sicherstellung des
              Betriebs verarbeitet.
            </li>
            <li>
              <strong>Bild- &amp; Dateispeicher:</strong> MinIO Object Storage (S3-kompatibel)
              auf der gleichen europäischen Infrastruktur.
            </li>
          </ul>
          <p>
            Eine darüber hinausgehende Weitergabe deiner Daten an Dritte erfolgt nicht. Es
            findet keine automatisierte Profilbildung statt.
          </p>

          <h2>Eingebettete Karten (Google Maps)</h2>
          <p>
            Auf der Startseite und ggf. auf der Kontaktseite binden wir eine Karte von Google
            Maps ein (Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4,
            Irland), damit du unser Vereinslokal leicht findest. Beim Laden der Karte werden
            technisch notwendige Daten (insbesondere IP-Adresse, Browser-Informationen) an
            Google übermittelt; Google kann zudem Cookies setzen. Rechtsgrundlage ist Art. 6
            Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer einfachen Anreiseinformation).
            Details findest du in der{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
            >
              Datenschutzerklärung von Google
            </a>
            .
          </p>

          <h2>Speicherdauer</h2>
          <p>
            Kontaktanfragen werden gelöscht, sobald sie nicht mehr benötigt werden, spätestens
            nach 24 Monaten. Daten aus Veranstaltungsanmeldungen werden bis zum Ende des
            Vereinsjahres aufbewahrt, sofern keine gesetzlichen Aufbewahrungsfristen
            entgegenstehen.
          </p>

          <h2>Deine Rechte</h2>
          <p>
            Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung
            der Verarbeitung sowie das Recht auf Datenübertragbarkeit und Widerspruch. Wende
            dich dafür an{" "}
            <a href="mailto:info@rallyeclub-klostertal.at">info@rallyeclub-klostertal.at</a>.
          </p>
          <p>
            Beschwerden kannst du bei der österreichischen Datenschutzbehörde (Barichgasse
            40-42, 1030 Wien,{" "}
            <a href="https://www.dsb.gv.at" target="_blank" rel="noreferrer">
              www.dsb.gv.at
            </a>
            ) einbringen.
          </p>
        </div>
      </div>
    </div>
  );
}
