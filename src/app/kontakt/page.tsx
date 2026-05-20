import { SectionHeader } from "@/components/section-header";
import { ContactForm } from "./contact-form";

export const metadata = {
  title: "Kontakt",
  description: "Kontaktdaten und Nachrichtenformular des Rallyeclub Klostertal.",
};

export default function ContactPage() {
  return (
    <div className="section">
      <div className="container-wide grid gap-16 md:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeader
            eyebrow="Kontakt"
            title="Nimm Kontakt auf"
            description="Fragen zur Vereinsmeisterschaft, Anmeldungen oder einfach Motorsport-Talk?"
          />

          <div className="mt-12 space-y-8 text-sm">
            <div>
              <div className="eyebrow">Vereinsadresse</div>
              <div className="mt-3 text-base text-ink">
                Rallyeclub Klostertal
                <br />
                Obmann Christoph Schuler
                <br />
                Amerdonastraße 22
                <br />
                6820 Frastanz
                <br />
                Österreich
              </div>
            </div>

            <div>
              <div className="eyebrow">Telefon</div>
              <a
                href="tel:+436643512997"
                className="mt-3 block text-base text-ink hover:text-racing"
              >
                0664 / 35 12 997
              </a>
            </div>

            <div>
              <div className="eyebrow">E-Mail</div>
              <a
                href="mailto:info@rallyeclub-klostertal.at"
                className="mt-3 block text-base text-ink hover:text-racing"
              >
                info@rallyeclub-klostertal.at
              </a>
            </div>
          </div>
        </div>

        <div className="border border-neutral-200 bg-neutral-50 p-8 md:p-12">
          <h2 className="font-display text-2xl tracking-wider text-ink md:text-3xl">
            Nachricht senden
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Wir melden uns so schnell wie möglich zurück.
          </p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
