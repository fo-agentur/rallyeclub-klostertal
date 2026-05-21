export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  as: Heading = "h1",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  return (
    <div
      className={
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl"
      }
    >
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <Heading className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
        {title}
      </Heading>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-neutral-600">{description}</p>
      )}
    </div>
  );
}
