import Image from "next/image";
import { SectionHeader } from "@/components/section-header";
import { BOARD, HONORARY, MEMBERS, type MemberGroup } from "@/content/members";

export const metadata = {
  title: "Mitglieder",
  description: "Vorstand und Mitglieder des Rallyeclub Klostertal.",
};

function MemberCard({
  name,
  role,
  photo,
  size = "md",
}: {
  name: string;
  role?: string;
  photo?: string;
  size?: "md" | "sm";
}) {
  return (
    <div className="group text-center">
      <div
        className={`relative mx-auto ${
          size === "md" ? "aspect-square w-full" : "aspect-square w-full"
        } overflow-hidden bg-neutral-100`}
      >
        {photo ? (
          <Image
            src={photo}
            alt={name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-ink text-racing">
            <span className="font-display text-3xl tracking-widest opacity-60">
              {name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </span>
          </div>
        )}
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

export default function MembersPage() {
  return (
    <div className="section">
      <div className="container-wide">
        <SectionHeader
          eyebrow="Der Verein"
          title="Vorstand & Mitglieder"
          description="Die Menschen hinter dem Rallyeclub Klostertal — Vorstand, Ehrenmitglieder und aktive Clubmitglieder."
        />

        <Group group={BOARD} columns={3} />
        <Group group={HONORARY} columns={4} />
        <Group group={MEMBERS} columns={4} />
      </div>
    </div>
  );
}
