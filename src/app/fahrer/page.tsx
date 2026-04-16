import { SectionHeader } from "@/components/section-header";
import { PortraitImage } from "@/components/portrait-image";
import { DRIVERS } from "@/content/drivers";

export const metadata = {
  title: "Aktive Fahrer",
  description: "Die aktiven Fahrer des Rallyeclub Klostertal und ihre Einsatzfahrzeuge.",
};

export default function DriversPage() {
  return (
    <div className="section">
      <div className="container-wide">
        <SectionHeader
          eyebrow="Motorsport"
          title="Aktive Fahrer"
          description="Die Fahrer, die den Rallyeclub Klostertal bei Slalom und Rundstrecke vertreten."
        />

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {DRIVERS.map((driver) => (
            <div key={driver.name} className="group border border-neutral-200 bg-white">
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                <PortraitImage
                  src={driver.photo}
                  alt={driver.name}
                  imgClassName="transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="border-t border-neutral-200 p-6">
                <div className="text-xs font-semibold uppercase tracking-widest text-racing">
                  Fahrzeug
                </div>
                <div className="mt-1 text-base font-semibold text-ink">{driver.car}</div>
                <h3 className="mt-3 font-display text-2xl tracking-wider text-ink">
                  {driver.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
