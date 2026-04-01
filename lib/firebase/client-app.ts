'use client'

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { readFirebaseWebClientEnv } from '@/lib/firebase/read-firebase-env'

export type FirebaseClients = {
  app: FirebaseApp
  auth: Auth
  db: Firestore
  storage: FirebaseStorage
}

let cached: FirebaseClients | null = null

export function getFirebaseClients(): FirebaseClients | null {
  if (cached) return cached
  const config = readFirebaseWebClientEnv()
  if (!config.apiKey || !config.projectId) {
    return null
  }
  const app = getApps().length ? getApps()[0]! : initializeApp(config)
  cached = {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app),
  }
  return cached
}
