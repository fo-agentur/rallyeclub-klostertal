import { SectionHeader } from "@/components/section-header";
import { PortraitImage } from "@/components/portrait-image";
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
          imgClassName="transition duration-500 group-hover:scale-105"
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
    <div className="mt-12">
      <h2 className="mb-8 font-display text-2xl tracking-wider text-ink md:text-3xl">
        {group.label}
      </h2>
      <div
        className={`grid gap-8 ${
          columns === 3
            ? "grid-cols-2 md:grid-cols-3"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        }`}
      >
        {group.members.map((m) => (
          <MemberCard key={m.name} {...m} />
        ))}
      </div>
    </div>
  );
}

export default async function MembersPage() {
  const people = await listPeople();
  const order = ["Vorstand", "Ehrenmitglieder", "Mitglieder"];
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

  return (
    <div className="section">
      <div className="container-wide">
        <SectionHeader
          eyebrow="Der Verein"
          title="Vorstand & Mitglieder"
          description="Die Menschen hinter dem Rallyeclub Klostertal: Vorstand, Ehrenmitglieder und aktive Clubmitglieder."
        />

        {groups.map((group) => (
          <Group key={group.label} group={group} columns={group.label === "Vorstand" ? 3 : 4} />
        ))}
      </div>
    </div>
  );
}
