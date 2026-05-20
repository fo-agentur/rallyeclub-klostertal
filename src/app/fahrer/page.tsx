import { SectionHeader } from "@/components/section-header";
import { PortraitImage } from "@/components/portrait-image";
import { listDrivers } from "@/lib/queries/people";

export const metadata = {
  title: "Aktive Fahrer",
  description: "Die aktiven Fahrer des Rallyeclub Klostertal und ihre Einsatzfahrzeuge.",
};

export default async function DriversPage() {
  const drivers = await listDrivers();

  return (
    <div className="section">
      <div className="container-wide">
        <SectionHeader
          eyebrow="Motorsport"
          title="Aktive Fahrer"
          description="Die Fahrer, die den Rallyeclub Klostertal bei Slalom und Rundstrecke vertreten."
        />

        {drivers.length === 0 ? (
          <p className="mt-12 text-sm text-neutral-500">
            Noch keine aktiven Fahrer in der Datenbank.
          </p>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {drivers.map((driver) => (
              <div key={driver.id} className="group border border-neutral-200 bg-white">
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                  <PortraitImage
                    src={driver.driver_photo ?? driver.photo ?? undefined}
                    alt={driver.name}
                    imgClassName="transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="border-t border-neutral-200 p-6">
                  <div className="text-xs font-semibold uppercase tracking-widest text-racing">
                    Fahrzeug
                  </div>
                  <div className="mt-1 text-base font-semibold text-ink">
                    {driver.car ?? "Nicht angegeben"}
                  </div>
                  <h3 className="mt-3 font-display text-2xl tracking-wider text-ink">
                    {driver.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
