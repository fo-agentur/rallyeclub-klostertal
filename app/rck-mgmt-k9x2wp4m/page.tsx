import dynamic from 'next/dynamic'

/** Client-only: verhindert Hydration-Mismatches (Firebase Auth, Vorschau-Sektionen). */
const AdminDashboard = dynamic(
  () => import('@/components/admin/AdminDashboard').then((m) => m.AdminDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-sm text-rally-muted">Verwaltung wird geladen …</p>
      </div>
    ),
  }
)

export default function AdminPage() {
  return <AdminDashboard />
}
