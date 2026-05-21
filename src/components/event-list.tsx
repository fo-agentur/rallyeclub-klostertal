import type { Event } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export function EventList({ events, emptyLabel }: { events: Event[]; emptyLabel?: string }) {
  if (events.length === 0) {
    return (
      <div className="border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
        {emptyLabel ?? "Aktuell keine Termine eingetragen."}
      </div>
    );
  }

  return (
    <ul className="grid gap-3 md:gap-4">
      {events.map((event) => {
        const day = formatDate(event.date, "dd");
        const month = formatDate(event.date, "MMM");
        const year = formatDate(event.date, "yyyy");

        return (
          <li
            key={event.id}
            className="card-hover group flex overflow-hidden border border-neutral-200 bg-white hover:border-racing/30 hover:shadow-card"
          >
            {/* Date block */}
            <time
              dateTime={event.date}
              className="relative flex w-20 shrink-0 flex-col items-center justify-center overflow-hidden bg-ink py-6 md:w-24"
            >
              <span className="absolute inset-0 -translate-y-full bg-racing transition-transform duration-500 ease-out group-hover:translate-y-0" aria-hidden />
              <span className="relative font-display text-3xl leading-none tracking-wider text-white md:text-4xl">
                {day}
              </span>
              <span className="relative mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 transition-colors group-hover:text-white/85">
                {month} {year}
              </span>
            </time>

            {/* Content */}
            <div className="flex flex-1 flex-col justify-center border-l border-neutral-100 px-6 py-5">
              <h3 className="text-base font-semibold leading-snug text-ink transition-colors group-hover:text-racing md:text-lg">
                {event.title}
              </h3>
              {event.location && (
                <p className="mt-0.5 text-sm text-neutral-500">{event.location}</p>
              )}
              {event.description && (
                <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
                  {event.description}
                </p>
              )}
            </div>

            {/* Racing accent stripe */}
            <div className="hidden w-1 shrink-0 origin-bottom scale-y-0 bg-racing transition-transform duration-300 ease-out group-hover:scale-y-100 md:block" />
          </li>
        );
      })}
    </ul>
  );
}
