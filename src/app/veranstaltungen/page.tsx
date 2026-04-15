import { SectionHeader } from "@/components/section-header";
import { EventList } from "@/components/event-list";
import { listUpcomingEvents, listPastEvents } from "@/lib/queries/events";

export const metadata = {
  title: "Veranstaltungen",
  description: "Kommende und vergangene Veranstaltungen des Rallyeclub Klostertal.",
};

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([listUpcomingEvents(), listPastEvents()]);

  return (
    <div className="section">
      <div className="container-wide">
        <SectionHeader
          eyebrow="Termine"
          title="Veranstaltungen"
          description="Slalom, Kartrennen, Clubfeste — der Jahreskalender des Rallyeclub Klostertal."
        />

        <div className="mt-16">
          <div className="mb-6 flex items-baseline gap-4">
            <h2 className="text-xl font-semibold text-ink">Kommende Termine</h2>
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              {upcoming.length} {upcoming.length === 1 ? "Eintrag" : "Einträge"}
            </span>
          </div>
          <EventList events={upcoming} emptyLabel="Aktuell keine kommenden Termine eingetragen." />
        </div>

        {past.length > 0 && (
          <div className="mt-20">
            <div className="mb-6 flex items-baseline gap-4">
              <h2 className="text-xl font-semibold text-neutral-500">Archiv</h2>
            </div>
            <div className="opacity-70">
              <EventList events={past} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
