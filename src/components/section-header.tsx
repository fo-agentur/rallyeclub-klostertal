export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl"
      }
    >
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-neutral-600">{description}</p>
      )}
    </div>
  );
}
