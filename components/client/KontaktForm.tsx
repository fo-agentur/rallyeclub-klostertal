'use client'

export function KontaktForm() {
  return (
    <form
      id="kontakt-form"
      className="glass rounded-2xl p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">Name</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            required
            className="min-h-[48px] w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-rally-muted/60 outline-none transition focus:border-rally-orange focus:ring-2 focus:ring-rally-orange/40"
            placeholder="Vor- und Nachname"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">E-Mail</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="min-h-[48px] w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-rally-muted/60 outline-none transition focus:border-rally-orange focus:ring-2 focus:ring-rally-orange/40"
            placeholder="name@beispiel.at"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">Telefon</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            className="min-h-[48px] w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-rally-muted/60 outline-none transition focus:border-rally-orange focus:ring-2 focus:ring-rally-orange/40"
            placeholder="+43 …"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">Nachricht</span>
          <textarea
            name="message"
            rows={5}
            required
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-rally-muted/60 outline-none transition focus:border-rally-orange focus:ring-2 focus:ring-rally-orange/40"
            placeholder="Deine Nachricht an uns …"
          />
        </label>
        <button
          type="submit"
          className="min-h-[48px] w-full rounded-full bg-gradient-to-r from-rally-accent to-rally-orange py-3 text-base font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Senden
        </button>
      </div>
      <p className="mt-4 text-xs text-rally-muted">
        Mit dem Absenden stimmst du der Verarbeitung deiner Angaben zum Zweck der Kontaktaufnahme zu (Hinweis: Formular ist ein Platzhalter
        bis zur Anbindung).
      </p>
    </form>
  )
}
