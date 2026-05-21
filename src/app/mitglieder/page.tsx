import { SectionHeader } from "@/components/section-header";
import { PortraitImage } from "@/components/portrait-image";
import { MemberGraph, type GraphMember } from "@/components/member-graph";
import { Reveal } from "@/components/reveal";
import { BOARD, HONORARY, MEMBERS, type MemberGroup } from "@/content/members";
import { listPeople } from "@/lib/queries/people";
import type { Member } from "@/content/members";

export const metadata = {
  title: "Mitglieder",
  description: "Vorstand und Mitglieder des Rallyeclub Klostertal.",
};

function MemberCard({ name, role, photo }: Member) {
  return (
    <div className="group text-center">
      <div className="relative mx-auto aspect-square w-full overflow-hidden bg-neutral-100">
        <PortraitImage
          src={photo}
          alt={name}
          imgClassName="transition duration-[700ms] ease-out group-hover:scale-[1.07]"
        />
      </div>
      <div className="mt-4">
        <div className="text-sm font-semibold text-ink">{name}</div>
        {role && (
          <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-racing">
            {role}
          </div>
        )}
      </div>
    </div>
  );
}

function Group({ group, columns }: { group: MemberGroup; columns: 3 | 4 }) {
  return (
    <div className="mt-16">
      <Reveal variant="up">
        <h2 className="mb-8 font-display text-2xl tracking-wider text-ink md:text-3xl">
          {group.label}
        </h2>
      </Reveal>
      <div
        className={`grid gap-8 ${
          columns === 3
            ? "grid-cols-2 md:grid-cols-3"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        }`}
      >
        {group.members.map((m, i) => (
          <Reveal key={m.name} variant="up" delay={i * 35}>
            <MemberCard {...m} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export default async function MembersPage() {
  const people = await listPeople();
  const order = ["Vorstand", "Ehrenmitglieder", "Mitglieder"];

  // Build groups for the list view (DB if available, fallback to static)
  const groups: MemberGroup[] =
    people.length > 0
      ? order
          .map((label) => ({
            label,
            members: people
              .filter((p) => p.group_label === label)
              .map((p) => ({
                name: p.name,
                role: p.role ?? undefined,
                photo: p.photo ?? undefined,
              })),
          }))
          .filter((group) => group.members.length > 0)
      : [BOARD, HONORARY, MEMBERS];

  // Build flat node list for the graph
  const graphMembers: GraphMember[] =
    people.length > 0
      ? people.map((p) => ({
          id: `p${p.id}`,
          name: p.name,
          role: p.role,
          group_label: p.group_label,
          photo: p.photo,
          is_driver: p.is_driver,
        }))
      : [BOARD, HONORARY, MEMBERS].flatMap((g) =>
          g.members.map((m, idx) => ({
            id: `${g.label}-${idx}`,
            name: m.name,
            role: m.role ?? null,
            group_label: g.label,
            photo: m.photo ?? null,
            is_driver: false,
          })),
        );

  const totalCount = graphMembers.length;

  return (
    <div className="section">
      <div className="container-wide">
        <SectionHeader
          eyebrow="Der Verein"
          title="Vorstand & Mitglieder"
          description="Die Menschen hinter dem Rallyeclub Klostertal: Vorstand, Ehrenmitglieder und aktive Clubmitglieder."
        />

        {/* ── GRAPH VIEW ─────────────────────────────────────────── */}
        <Reveal variant="fade">
          <div className="mt-10">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="sec-kicker !mb-2">Netzwerk</div>
                <h2 className="font-display text-3xl uppercase tracking-wider text-ink md:text-4xl">
                  Der Club als <em className="not-italic text-racing">Netzwerk</em>
                </h2>
              </div>
              <p className="max-w-md text-xs leading-relaxed text-neutral-500 sm:text-sm">
                {totalCount} Personen, verbunden über Vorstand, Rollen und Familien.
                Über Punkte fahren oder antippen zeigt Verbindungen.
              </p>
            </div>
            <MemberGraph members={graphMembers} />
          </div>
        </Reveal>

        {/* ── LIST VIEW ──────────────────────────────────────────── */}
        <div className="mt-20">
          <Reveal>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="sec-kicker !mb-2">Übersicht</div>
                <h2 className="font-display text-3xl uppercase tracking-wider text-ink md:text-4xl">
                  Alle <em className="not-italic text-racing">Mitglieder</em>
                </h2>
              </div>
              <p className="max-w-md text-xs leading-relaxed text-neutral-500 sm:text-sm">
                Vollständige Liste, gegliedert nach Vorstand, Ehrenmitgliedern und aktiven
                Mitgliedern.
              </p>
            </div>
          </Reveal>

          {groups.map((group) => (
            <Group
              key={group.label}
              group={group}
              columns={group.label === "Vorstand" ? 3 : 4}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
