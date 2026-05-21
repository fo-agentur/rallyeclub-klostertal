import { SectionHeader } from "@/components/section-header";
import { PortraitImage } from "@/components/portrait-image";
import { DRIVERS } from "@/content/drivers";
import { listDrivers } from "@/lib/queries/people";

export const metadata = {
  title: "Aktive Fahrer",
  description: "Die aktiven Fahrer des Rallyeclub Klostertal und ihre Einsatzfahrzeuge.",
};

export default async function DriversPage() {
  const databaseDrivers = await listDrivers();
  const drivers =
    databaseDrivers.length > 0
      ? databaseDrivers.map((driver) => ({
          name: driver.name,
          car: driver.car ?? null,
          photo: driver.driver_photo ?? driver.photo ?? undefined,
        }))
      : DRIVERS.map((d) => ({ name: d.name, car: d.car ?? null, photo: d.photo }));

  return (
    <div className="section">
      <div className="container-wide">
        <SectionHeader
          eyebrow="Motorsport"
          title="Aktive Fahrer"
          description="Die Fahrer, die den Rallyeclub Klostertal bei Slalom und Rundstrecke vertreten."
        />

        {drivers.length === 0 ? (
          <div className="mt-12 border border-dashed border-neutral-300 p-12 text-center text-sm text-neutral-500">
            Aktuell keine aktiven Fahrer erfasst.
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {drivers.map((driver) => (
              <article key={driver.name} className="group border border-neutral-200 bg-white">
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                  <PortraitImage
                    src={driver.photo}
                    alt={`Fahrerportrait ${driver.name}`}
                    imgClassName="transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="border-t border-neutral-200 p-6">
                  {driver.car && (
                    <>
                      <div className="text-xs font-semibold uppercase tracking-widest text-racing">
                        Fahrzeug
                      </div>
                      <div className="mt-1 text-base font-semibold text-ink">{driver.car}</div>
                    </>
                  )}
                  <h3 className={`font-display text-2xl tracking-wider text-ink ${driver.car ? "mt-3" : ""}`}>
                    {driver.name}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
