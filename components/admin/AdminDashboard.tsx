'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc, addDoc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { siteContentSchema, type SiteContent } from '@/lib/schemas/site-content'
import { termineItemSchema, type TermineItem } from '@/lib/schemas/termine'
import {
  assertImageUploadAllowed,
  CMS_LIMITS,
  formatMaxImageSizeLabel,
  validateSiteContentLimits,
} from '@/lib/cms-limits'
import { defaultSiteContent } from '@/lib/default-site-data'
import { getFirebaseClients } from '@/lib/firebase/client-app'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import { AdminSitePreview } from '@/components/admin/AdminSitePreview'
import {
  HighlightsEditor,
  SimpleImageRows,
  TermineOverviewEditor,
  normalizeHighlightVariants,
} from '@/components/admin/AdminSimpleEditors'

function forFirestore(data: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined))
}

async function revalidateSiteCache(user: User) {
  const token = await user.getIdToken()
  await fetch('/api/revalidate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
}

export function AdminDashboard() {
  const clients = getFirebaseClients()
  /** Avoid SSR/client HTML mismatch: Firebase Auth only runs in the browser. */
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [site, setSite] = useState<SiteContent>(defaultSiteContent)
  const [termine, setTermine] = useState<TermineItem[]>([])
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!clients) {
      setAuthReady(true)
      return
    }
    const unsub = onAuthStateChanged(clients.auth, async (u) => {
      setUser(u)
      if (u) {
        const tr = await u.getIdTokenResult(true)
        setIsAdmin(tr.claims.admin === true)
      } else {
        setIsAdmin(false)
      }
      setAuthReady(true)
    })
    return () => unsub()
  }, [clients])

  useEffect(() => {
    if (!clients || !user || !isAdmin) return
    const unsub = onSnapshot(doc(clients.db, 'site', 'content'), (snap) => {
      if (!snap.exists()) {
        setSite(defaultSiteContent)
        return
      }
      const parsed = siteContentSchema.safeParse(snap.data())
      setSite(
        parsed.success
          ? { ...parsed.data, highlights: normalizeHighlightVariants(parsed.data.highlights) }
          : defaultSiteContent
      )
    })
    return () => unsub()
  }, [clients, user, isAdmin])

  const loadTermine = useCallback(async () => {
    if (!clients) return
    const qs = await getDocs(collection(clients.db, 'termine'))
    const rows: TermineItem[] = []
    qs.forEach((d) => {
      const p = termineItemSchema.safeParse(d.data())
      if (p.success) rows.push({ ...p.data, id: d.id })
    })
    rows.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
    setTermine(rows)
  }, [clients])

  useEffect(() => {
    if (clients && user && isAdmin) void loadTermine()
  }, [clients, user, isAdmin, loadTermine])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    if (!clients) {
      setAuthError('Firebase Client nicht konfiguriert — Web-Env in .env.local setzen (siehe .env.example).')
      return
    }
    try {
      await signInWithEmailAndPassword(clients.auth, email, password)
    } catch {
      setAuthError('Anmeldung fehlgeschlagen.')
    }
  }

  const saveSite = async () => {
    if (!clients || !user || !isAdmin) return
    setBusy(true)
    setSaveMsg(null)
    try {
      const limitErr = validateSiteContentLimits(site)
      if (limitErr) {
        setSaveMsg(limitErr)
        return
      }
      const toSave = { ...site, highlights: normalizeHighlightVariants(site.highlights) }
      const parsed = siteContentSchema.parse(toSave)
      await setDoc(doc(clients.db, 'site', 'content'), parsed)
      await revalidateSiteCache(user)
      setSaveMsg('Gespeichert und Cache aktualisiert.')
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : 'Validierung fehlgeschlagen')
    } finally {
      setBusy(false)
    }
  }

  const uploadToCms = async (file: File, folder: string) => {
    if (!clients || !user || !isAdmin) throw new Error('Nicht angemeldet')
    const denied = assertImageUploadAllowed(file)
    if (denied) throw new Error(denied)
    // Refresh ID token so Storage Rules see aktuelles Custom Claim admin (nach set-admin-claim).
    await user.getIdToken(true)
    const path = `cms/${folder}/${Date.now()}-${safeFileName(file.name)}`
    const storageRef = ref(clients.storage, path)
    await uploadBytes(storageRef, file, { contentType: file.type || 'application/octet-stream' })
    return getDownloadURL(storageRef)
  }

  if (!clients) {
    return (
      <div className="mx-auto max-w-lg p-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin nicht verfügbar</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-rally-muted">
            Bitte Firebase-Web-Variablen in <code className="text-white">.env.local</code> setzen (Vorlage:{' '}
            <code className="text-white">.env.example</code>, z. B.{' '}
            <code className="text-white">NEXT_PUBLIC_FIREBASE_WEB_API_KEY</code>). Secrets niemals ins Git committen.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!mounted || !authReady) {
    return <p className="p-8 text-center text-rally-muted">Lade …</p>
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-6 p-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleLogin}>
              <div className="grid gap-2">
                <Label htmlFor="adm-email">E-Mail</Label>
                <Input id="adm-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adm-pw">Passwort</Label>
                <Input
                  id="adm-pw"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {authError ? <p className="text-sm text-rally-accent">{authError}</p> : null}
              <p className="text-xs text-rally-muted">
                Nur Konten mit Custom Claim <code className="text-white">admin: true</code> (setzen per{' '}
                <code className="text-white">npm run set-admin-claim</code>).
              </p>
              <Button type="submit">Anmelden</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rally-bg pb-20">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-lg font-bold text-white md:text-xl">Website bearbeiten</h1>
            <p className="text-xs text-rally-muted">Rechts siehst du die Vorschau — „Website speichern“ übernimmt alles für die Startseite.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {saveMsg ? <span className="max-w-[220px] text-xs text-rally-orange md:max-w-sm">{saveMsg}</span> : null}
            <Button type="button" disabled={busy} onClick={() => void saveSite()}>
              Website speichern
            </Button>
            <Button type="button" variant="secondary" onClick={() => signOut(clients.auth)}>
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 pt-6">
        <details className="mb-6 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-xs text-rally-muted">
          <summary className="cursor-pointer font-medium text-white/90">Speicher-Limits (optional lesen)</summary>
          <p className="mt-2 leading-relaxed">
            Pro Bild max. <strong className="text-white">{formatMaxImageSizeLabel()}</strong>. Hero bis{' '}
            <strong className="text-white">{CMS_LIMITS.maxHeroSlides}</strong> Slides, Team{' '}
            <strong className="text-white">{CMS_LIMITS.maxTeamMembers}</strong>, Club-Streifen{' '}
            <strong className="text-white">{CMS_LIMITS.maxClubStripImages}</strong>, Galerie{' '}
            <strong className="text-white">{CMS_LIMITS.maxGalleryImages}</strong>, Highlights{' '}
            <strong className="text-white">{CMS_LIMITS.maxHighlightCards}</strong>, Termine in der Datenbank{' '}
            <strong className="text-white">{CMS_LIMITS.maxTermineDocuments}</strong>.
          </p>
        </details>

        <div className="grid gap-8 xl:grid-cols-[minmax(300px,380px)_1fr] xl:items-start">
          <div className="min-w-0 space-y-1 xl:max-h-[calc(100vh-9rem)] xl:overflow-y-auto xl:pr-2">
            <Tabs defaultValue="start" className="w-full">
              <TabsList className="flex h-auto min-h-11 flex-wrap justify-start gap-1 bg-white/5 p-1">
                <TabsTrigger value="start" className="text-xs sm:text-sm">
                  Start
                </TabsTrigger>
                <TabsTrigger value="social" className="text-xs sm:text-sm">
                  Facebook
                </TabsTrigger>
                <TabsTrigger value="team" className="text-xs sm:text-sm">
                  Team
                </TabsTrigger>
                <TabsTrigger value="bilder" className="text-xs sm:text-sm">
                  Bilder
                </TabsTrigger>
                <TabsTrigger value="termine" className="text-xs sm:text-sm">
                  Termine
                </TabsTrigger>
                <TabsTrigger value="kontakt" className="text-xs sm:text-sm">
                  Kontakt
                </TabsTrigger>
                <TabsTrigger value="vorschau" className="text-xs sm:text-sm xl:hidden">
                  Vorschau
                </TabsTrigger>
              </TabsList>

              <TabsContent value="start" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Startseite — großes Bild oben</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Überschrift über dem Bild</Label>
                      <Input value={site.heroTagline} onChange={(e) => setSite({ ...site, heroTagline: e.target.value })} />
                    </div>
                    {site.heroSlides.map((slide, i) => (
                      <div key={i} className="space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                        <p className="text-xs font-semibold text-rally-orange">Bild {i + 1}</p>
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="h-24 w-40 overflow-hidden rounded-md border border-white/10">
                            <Image src={slide.imageSrc} alt="" width={160} height={96} className="h-full w-full object-cover" unoptimized />
                          </div>
                          <div>
                            <Label className="text-xs">Neues Bild hochladen</Label>
                            <input
                              type="file"
                              accept="image/*"
                              className="mt-1 block max-w-[220px] text-xs file:mr-2 file:rounded file:border-0 file:bg-rally-orange/25 file:px-2 file:py-1 file:text-white"
                              onChange={async (e) => {
                                const f = e.target.files?.[0]
                                if (!f) return
                                setSaveMsg(null)
                                setBusy(true)
                                try {
                                  const url = await uploadToCms(f, 'hero')
                                  const next = [...site.heroSlides]
                                  next[i] = { ...next[i], imageSrc: url }
                                  setSite({ ...site, heroSlides: next })
                                } catch (err) {
                                  setSaveMsg(err instanceof Error ? err.message : 'Upload fehlgeschlagen')
                                } finally {
                                  setBusy(false)
                                }
                              }}
                            />
                          </div>
                        </div>
                        <details className="text-xs">
                          <summary className="cursor-pointer text-rally-muted">Bild-Link manuell (nur wenn nötig)</summary>
                          <Input
                            className="mt-2"
                            value={slide.imageSrc}
                            onChange={(e) => {
                              const next = [...site.heroSlides]
                              next[i] = { ...next[i], imageSrc: e.target.value }
                              setSite({ ...site, heroSlides: next })
                            }}
                          />
                        </details>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={site.heroSlides.length >= CMS_LIMITS.maxHeroSlides}
                        onClick={() => {
                          if (site.heroSlides.length >= CMS_LIMITS.maxHeroSlides) {
                            setSaveMsg(`Maximal ${CMS_LIMITS.maxHeroSlides} Bilder.`)
                            return
                          }
                          setSaveMsg(null)
                          setSite({ ...site, heroSlides: [...site.heroSlides, { imageSrc: '/images/headers/hero-hq-1.png' }] })
                        }}
                      >
                        Weiteres Bild
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSite({ ...site, heroSlides: site.heroSlides.slice(0, -1) })}
                        disabled={site.heroSlides.length <= 1}
                      >
                        Letztes entfernen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="social" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Facebook &amp; andere Links</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div>
                      <Label>Facebook (Link zur Seite)</Label>
                      <Input
                        value={site.social.facebookUrl}
                        onChange={(e) => setSite({ ...site, social: { ...site.social, facebookUrl: e.target.value } })}
                      />
                    </div>
                    <div>
                      <Label>Instagram</Label>
                      <Input
                        value={site.social.instagramUrl}
                        onChange={(e) => setSite({ ...site, social: { ...site.social, instagramUrl: e.target.value } })}
                      />
                    </div>
                    <div>
                      <Label>YouTube</Label>
                      <Input
                        value={site.social.youtubeUrl}
                        onChange={(e) => setSite({ ...site, social: { ...site.social, youtubeUrl: e.target.value } })}
                      />
                    </div>
                    <div>
                      <Label>Text auf dem Facebook-Button (Startseite)</Label>
                      <Input
                        value={site.social.heroFacebookButtonLabel ?? ''}
                        onChange={(e) => setSite({ ...site, social: { ...site.social, heroFacebookButtonLabel: e.target.value } })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Vorstand — Fotos &amp; Namen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {site.teamMembers.map((m, i) => (
                      <div key={m.id} className="space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={m.name}
                              onChange={(e) => {
                                const next = [...site.teamMembers]
                                next[i] = { ...next[i], name: e.target.value }
                                setSite({ ...site, teamMembers: next })
                              }}
                            />
                          </div>
                          <div>
                            <Label>Funktion</Label>
                            <Input
                              value={m.role}
                              onChange={(e) => {
                                const next = [...site.teamMembers]
                                next[i] = { ...next[i], role: e.target.value }
                                setSite({ ...site, teamMembers: next })
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="h-28 w-24 overflow-hidden rounded-md border border-white/10">
                            <Image src={m.imageSrc} alt="" width={96} height={112} className="h-full w-full object-cover" unoptimized />
                          </div>
                          <div>
                            <Label className="text-xs">Foto ersetzen</Label>
                            <input
                              type="file"
                              accept="image/*"
                              className="mt-1 block text-xs file:mr-2 file:rounded file:border-0 file:bg-rally-orange/25 file:px-2 file:py-1 file:text-white"
                              onChange={async (e) => {
                                const f = e.target.files?.[0]
                                if (!f) return
                                setSaveMsg(null)
                                setBusy(true)
                                try {
                                  const url = await uploadToCms(f, 'team')
                                  const next = [...site.teamMembers]
                                  next[i] = { ...next[i], imageSrc: url }
                                  setSite({ ...site, teamMembers: next })
                                } catch (err) {
                                  setSaveMsg(err instanceof Error ? err.message : 'Upload fehlgeschlagen')
                                } finally {
                                  setBusy(false)
                                }
                              }}
                            />
                          </div>
                        </div>
                        <details className="text-xs">
                          <summary className="cursor-pointer text-rally-muted">Foto-Link manuell (optional)</summary>
                          <Input
                            className="mt-2"
                            value={m.imageSrc}
                            onChange={(e) => {
                              const next = [...site.teamMembers]
                              next[i] = { ...next[i], imageSrc: e.target.value }
                              setSite({ ...site, teamMembers: next })
                            }}
                          />
                        </details>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={site.teamMembers.length >= CMS_LIMITS.maxTeamMembers}
                        onClick={() => {
                          if (site.teamMembers.length >= CMS_LIMITS.maxTeamMembers) {
                            setSaveMsg(`Maximal ${CMS_LIMITS.maxTeamMembers} Personen.`)
                            return
                          }
                          setSaveMsg(null)
                          setSite({
                            ...site,
                            teamMembers: [
                              ...site.teamMembers,
                              {
                                id: `m-${Date.now()}`,
                                name: 'Neues Mitglied',
                                role: 'Funktion',
                                imageSrc: '/images/team/christoph-schuler.jpg',
                              },
                            ],
                          })
                        }}
                      >
                        Person hinzufügen
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={site.teamMembers.length <= 1}
                        onClick={() => setSite({ ...site, teamMembers: site.teamMembers.slice(0, -1) })}
                      >
                        Letzte entfernen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bilder" className="mt-4 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Bilder &amp; Events</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <SimpleImageRows
                      title="Streifen beim Club-Bereich"
                      hint="Die kleinen Bilder in der langen Leiste im Abschnitt „Club“."
                      items={site.clubStripImages}
                      onChange={(clubStripImages) => setSite({ ...site, clubStripImages })}
                      folder="club"
                      upload={uploadToCms}
                      setBusy={setBusy}
                      maxItems={CMS_LIMITS.maxClubStripImages}
                      onMessage={setSaveMsg}
                    />
                    <HighlightsEditor
                      highlights={site.highlights}
                      onChange={(highlights) => setSite({ ...site, highlights })}
                      upload={uploadToCms}
                      setBusy={setBusy}
                      onMessage={setSaveMsg}
                    />
                    <SimpleImageRows
                      title="Galerie"
                      hint="Bilder für den großen Galerie-Bereich."
                      items={site.galleryImages}
                      onChange={(galleryImages) => setSite({ ...site, galleryImages })}
                      folder="gallery"
                      upload={uploadToCms}
                      setBusy={setBusy}
                      maxItems={CMS_LIMITS.maxGalleryImages}
                      onMessage={setSaveMsg}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="termine" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Termine (Kalender &amp; Liste)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-rally-muted">
                      Jeder Termin wird einzeln gespeichert. Die Vorschau rechts zeigt sofort, wie er auf der Website wirkt.
                    </p>
                    {termine.map((t) => (
                      <div key={t.id} className="space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <Label>Titel</Label>
                            <Input
                              value={t.title}
                              onChange={(e) => setTermine(termine.map((x) => (x.id === t.id ? { ...x, title: e.target.value } : x)))}
                            />
                          </div>
                          <div>
                            <Label>Anzeige-Datum / Zeitfenster</Label>
                            <Input
                              value={t.dateStr}
                              onChange={(e) => setTermine(termine.map((x) => (x.id === t.id ? { ...x, dateStr: e.target.value } : x)))}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <Label>Ort</Label>
                            <Input
                              value={t.location}
                              onChange={(e) => setTermine(termine.map((x) => (x.id === t.id ? { ...x, location: e.target.value } : x)))}
                            />
                          </div>
                          <div>
                            <Label>Art (z. B. Slalom, Club)</Label>
                            <Input
                              value={t.category ?? ''}
                              onChange={(e) => setTermine(termine.map((x) => (x.id === t.id ? { ...x, category: e.target.value } : x)))}
                            />
                          </div>
                          <div>
                            <Label>Tag im Kalender</Label>
                            <Input
                              type="date"
                              value={t.calendarDate ?? ''}
                              onChange={(e) =>
                                setTermine(
                                  termine.map((x) =>
                                    x.id === t.id ? { ...x, calendarDate: e.target.value || undefined } : x
                                  )
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label>Reihenfolge (kleine Zahl = weiter oben)</Label>
                            <Input
                              type="number"
                              value={t.sortOrder ?? ''}
                              onChange={(e) =>
                                setTermine(
                                  termine.map((x) =>
                                    x.id === t.id ? { ...x, sortOrder: Number(e.target.value) || undefined } : x
                                  )
                                )
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Zusatztext</Label>
                          <Textarea
                            value={t.description ?? ''}
                            onChange={(e) => setTermine(termine.map((x) => (x.id === t.id ? { ...x, description: e.target.value } : x)))}
                            rows={2}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={async () => {
                              if (!clients) return
                              setBusy(true)
                              try {
                                const { id, ...rest } = t
                                const parsed = termineItemSchema.parse(rest)
                                await updateDoc(doc(clients.db, 'termine', id), forFirestore(parsed as Record<string, unknown>))
                                await revalidateSiteCache(user)
                                setSaveMsg('Termin gespeichert.')
                              } finally {
                                setBusy(false)
                              }
                            }}
                          >
                            Diesen Termin speichern
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              if (!clients) return
                              setBusy(true)
                              try {
                                await deleteDoc(doc(clients.db, 'termine', t.id))
                                await loadTermine()
                                await revalidateSiteCache(user)
                                setSaveMsg('Termin gelöscht.')
                              } finally {
                                setBusy(false)
                              }
                            }}
                          >
                            Löschen
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      disabled={termine.length >= CMS_LIMITS.maxTermineDocuments}
                      onClick={async () => {
                        if (!clients) return
                        if (termine.length >= CMS_LIMITS.maxTermineDocuments) {
                          setSaveMsg(`Maximal ${CMS_LIMITS.maxTermineDocuments} Termine.`)
                          return
                        }
                        setSaveMsg(null)
                        setBusy(true)
                        try {
                          const draft = termineItemSchema.parse({
                            title: 'Neuer Termin',
                            dateStr: '2026',
                            location: 'Ort',
                            category: 'Event',
                            description: '',
                            calendarDate: '2026-06-01',
                            sortOrder: termine.length + 1,
                          })
                          await addDoc(collection(clients.db, 'termine'), forFirestore(draft as Record<string, unknown>))
                          await loadTermine()
                          await revalidateSiteCache(user)
                          setSaveMsg('Neuer Termin angelegt.')
                        } finally {
                          setBusy(false)
                        }
                      }}
                    >
                      Neuen Termin anlegen
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="kontakt" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Kontakt, Saison &amp; kleine Termin-Karten</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div>
                      <Label>Kontakt-E-Mail</Label>
                      <Input type="email" value={site.contactEmail} onChange={(e) => setSite({ ...site, contactEmail: e.target.value })} />
                    </div>
                    <div>
                      <Label>Google Maps (Suchlink)</Label>
                      <Input value={site.mapSearchUrl} onChange={(e) => setSite({ ...site, mapSearchUrl: e.target.value })} />
                    </div>
                    <div>
                      <Label>Saison (z. B. Saison 2026)</Label>
                      <Input value={site.seasonLabel} onChange={(e) => setSite({ ...site, seasonLabel: e.target.value })} />
                    </div>
                    <div>
                      <Label>Text über den Terminen</Label>
                      <Textarea value={site.termineIntro} onChange={(e) => setSite({ ...site, termineIntro: e.target.value })} rows={3} />
                    </div>
                    <div>
                      <Label>Teaser-Link Galerie (Facebook, optional)</Label>
                      <Input
                        value={site.galleryFacebookTeaser ?? ''}
                        onChange={(e) => setSite({ ...site, galleryFacebookTeaser: e.target.value })}
                      />
                    </div>
                    <TermineOverviewEditor
                      cards={site.termineOverviewCards}
                      onChange={(termineOverviewCards) => setSite({ ...site, termineOverviewCards })}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vorschau" className="mt-4 xl:hidden">
                <AdminSitePreview site={site} termine={termine} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="hidden min-w-0 xl:block xl:sticky xl:top-24">
            <AdminSitePreview site={site} termine={termine} />
          </div>
        </div>
      </div>
    </div>
  )
}
