import type { Event } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export function EventList({ events, emptyLabel }: { events: Event[]; emptyLabel?: string }) {
  if (events.length === 0) {
    return (
      <div className="border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
        {emptyLabel ?? "Aktuell keine Termine eingetragen."}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
      {events.map((event) => (
        <li key={event.id} className="py-6 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
            <div className="flex shrink-0 items-baseline gap-3 md:w-44 md:flex-col md:gap-1">
              <time
                dateTime={event.date}
                className="font-display text-3xl leading-none tracking-wider text-racing md:text-4xl"
              >
                {new Date(event.date).getDate().toString().padStart(2, "0")}
              </time>
              <div className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                {formatDate(event.date, "MMM yyyy")}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-ink">{event.title}</h3>
              {event.location && (
                <p className="mt-1 text-sm text-neutral-500">{event.location}</p>
              )}
              {event.description && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
