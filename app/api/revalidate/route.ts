import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getAuth } from 'firebase-admin/auth'
import { getFirebaseAdminApp } from '@/lib/firebase/admin-app'

export async function POST(req: NextRequest) {
  const app = getFirebaseAdminApp()
  if (!app) {
    return NextResponse.json(
      { error: 'FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON (or FIREBASE_SERVICE_ACCOUNT_JSON) not configured' },
      { status: 500 }
    )
  }
  const authz = req.headers.get('authorization')
  const token = authz?.startsWith('Bearer ') ? authz.slice(7) : null
  if (!token) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 })
  }
  try {
    const decoded = await getAuth(app).verifyIdToken(token)
    if (decoded.admin !== true) {
      return NextResponse.json({ error: 'Admin claim required' }, { status: 403 })
    }
    revalidateTag('site-content')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
