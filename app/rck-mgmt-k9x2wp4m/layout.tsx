import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verwaltung — Rallyeclub Klostertal',
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-rally-bg text-white">
      <div className="border-b border-white/10 bg-black/40 px-4 py-3">
        <p className="text-center text-xs text-rally-muted">
          Interner Bereich — nicht verlinkt. Zugriff nur mit Admin-Konto und Custom Claim.
        </p>
      </div>
      {children}
    </div>
  )
}
