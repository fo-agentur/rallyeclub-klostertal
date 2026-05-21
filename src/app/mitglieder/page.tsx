import { SectionHeader } from "@/components/section-header";
import { PortraitImage } from "@/components/portrait-image";
import { MemberGraph, type GraphMember } from "@/components/member-graph";
import { Reveal } from "@/components/reveal";
import { BOARD, HONORARY, MEMBERS } from "@/content/members";
import { listPeople } from "@/lib/queries/people";
import type { Member } from "@/content/members";

export const metadata = {
  title: "Mitglieder",
  description: "Vorstand und Mitglieder des Rallyeclub Klostertal.",
};

type ListMember = Member & {
  anchorId: string;
};

type ListGroup = {
  label: string;
  members: ListMember[];
};

function anchorSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function groupFallbacks(): ListGroup[] {
  return [BOARD, HONORARY, MEMBERS].map((group) => ({
    label: group.label,
    members: group.members.map((member, index) => ({
      ...member,
      anchorId: `member-${anchorSlug(group.label)}-${index}`,
    })),
  }));
}

function MemberCard({ name, role, photo, anchorId }: ListMember) {
  return (
    <article
      id={anchorId}
      tabIndex={-1}
      className="group scroll-mt-28 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-racing focus-visible:ring-offset-4"
    >
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
    </article>
  );
}

function Group({ group, columns }: { group: ListGroup; columns: 3 | 4 }) {
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
  const groups: ListGroup[] =
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
                anchorId: `member-${p.id}`,
              })),
          }))
          .filter((group) => group.members.length > 0)
      : groupFallbacks();

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
          anchorId: `member-${p.id}`,
        }))
      : groups.flatMap((g) =>
          g.members.map((m, idx) => ({
            id: `${g.label}-${idx}`,
            name: m.name,
            role: m.role ?? null,
            group_label: g.label,
            photo: m.photo ?? null,
            is_driver: false,
            anchorId: m.anchorId,
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
            <div className="mb-5 grid gap-4 border-l-4 border-racing bg-neutral-50 px-4 py-4 md:grid-cols-[minmax(0,1fr)_420px] md:items-end md:px-5">
              <div>
                <div className="sec-kicker !mb-2">Netzwerk</div>
                <h2 className="font-display text-3xl uppercase tracking-wider text-ink md:text-4xl">
                  Mitglieder-<em className="not-italic text-racing">Netz</em>
                </h2>
              </div>
              <div className="space-y-3">
                <p className="text-xs leading-relaxed text-neutral-600 sm:text-sm">
                  {totalCount} Personen, sauber nach Vorstand, Ehrenmitgliedern und Mitgliedern
                  angeordnet. Linien zeigen direkte Zugehörigkeiten, Familiennamen und Rollen.
                </p>
                <div className="grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                  <span className="flex items-center gap-2 border border-neutral-200 bg-white px-2 py-2">
                    <span className="h-2 w-2 bg-racing" />
                    Vorstand
                  </span>
                  <span className="flex items-center gap-2 border border-neutral-200 bg-white px-2 py-2">
                    <span className="h-2 w-2 bg-[#D7A84A]" />
                    Ehren
                  </span>
                  <span className="flex items-center gap-2 border border-neutral-200 bg-white px-2 py-2">
                    <span className="h-2 w-2 bg-[#D8DEE8]" />
                    Mitglieder
                  </span>
                </div>
              </div>
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
