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
      setSite(parsed.success ? parsed.data : defaultSiteContent)
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
      const parsed = siteContentSchema.parse(site)
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

  if (!authReady) {
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Inhalte verwalten</h1>
        <Button type="button" variant="secondary" onClick={() => signOut(clients.auth)}>
          Abmelden
        </Button>
      </div>

      <Card className="mb-6 border-white/15 bg-white/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Speicher- &amp; Upload-Limits</CardTitle>
        </CardHeader>
        <CardContent className="text-xs leading-relaxed text-rally-muted">
          <p>
            Uploads sind begrenzt, damit Firebase Storage und Traffic klein bleiben (Vereinsseite, Free-Tier).
            Pro Bild max. <strong className="text-white">{formatMaxImageSizeLabel()}</strong>, nur Bilder. Zusätzlich:
            Hero bis <strong className="text-white">{CMS_LIMITS.maxHeroSlides}</strong> Slides, Team bis{' '}
            <strong className="text-white">{CMS_LIMITS.maxTeamMembers}</strong>, Club-Streifen{' '}
            <strong className="text-white">{CMS_LIMITS.maxClubStripImages}</strong>, Galerie{' '}
            <strong className="text-white">{CMS_LIMITS.maxGalleryImages}</strong>, Highlights{' '}
            <strong className="text-white">{CMS_LIMITS.maxHighlightCards}</strong>, Termine{' '}
            <strong className="text-white">{CMS_LIMITS.maxTermineDocuments}</strong>. Überschüssige Einträge werden auf
            der öffentlichen Seite nicht angezeigt, bis du sie im CMS reduzierst.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="hero">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="social">Links</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="media">Bilder</TabsTrigger>
          <TabsTrigger value="termine">Termine</TabsTrigger>
          <TabsTrigger value="kontakt">Kontakt</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero — Slideshow</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Tagline</Label>
                <Input value={site.heroTagline} onChange={(e) => setSite({ ...site, heroTagline: e.target.value })} />
              </div>
              {site.heroSlides.map((slide, i) => (
                <div key={i} className="flex flex-wrap items-end gap-3 rounded-lg border border-white/10 p-3">
                  <div className="min-w-[200px] flex-1">
                    <Label>Bild-URL {i + 1}</Label>
                    <Input value={slide.imageSrc} onChange={(e) => {
                      const next = [...site.heroSlides]
                      next[i] = { ...next[i], imageSrc: e.target.value }
                      setSite({ ...site, heroSlides: next })
                    }} />
                  </div>
                  <div className="h-20 w-32 overflow-hidden rounded border border-white/10">
                    <Image src={slide.imageSrc} alt="" width={128} height={80} className="h-full w-full object-cover" unoptimized />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="max-w-xs text-xs"
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
              ))}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={site.heroSlides.length >= CMS_LIMITS.maxHeroSlides}
                  onClick={() => {
                    if (site.heroSlides.length >= CMS_LIMITS.maxHeroSlides) {
                      setSaveMsg(`Maximal ${CMS_LIMITS.maxHeroSlides} Hero-Slides.`)
                      return
                    }
                    setSaveMsg(null)
                    setSite({ ...site, heroSlides: [...site.heroSlides, { imageSrc: '/images/headers/hero-hq-1.png' }] })
                  }}
                >
                  Slide hinzufügen
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSite({ ...site, heroSlides: site.heroSlides.slice(0, -1) })}
                  disabled={site.heroSlides.length <= 1}
                >
                  Letzten entfernen
                </Button>
              </div>
              <PreviewHero site={site} />
              <Button type="button" disabled={busy} onClick={() => void saveSite()}>
                Speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social &amp; Hero-Button</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div>
                <Label>Facebook URL</Label>
                <Input
                  value={site.social.facebookUrl}
                  onChange={(e) => setSite({ ...site, social: { ...site.social, facebookUrl: e.target.value } })}
                />
              </div>
              <div>
                <Label>Instagram URL</Label>
                <Input
                  value={site.social.instagramUrl}
                  onChange={(e) => setSite({ ...site, social: { ...site.social, instagramUrl: e.target.value } })}
                />
              </div>
              <div>
                <Label>YouTube URL</Label>
                <Input
                  value={site.social.youtubeUrl}
                  onChange={(e) => setSite({ ...site, social: { ...site.social, youtubeUrl: e.target.value } })}
                />
              </div>
              <div>
                <Label>Hero Facebook Button Text</Label>
                <Input
                  value={site.social.heroFacebookButtonLabel ?? ''}
                  onChange={(e) => setSite({ ...site, social: { ...site.social, heroFacebookButtonLabel: e.target.value } })}
                />
              </div>
              <PreviewSocial site={site} />
              <Button type="button" disabled={busy} onClick={() => void saveSite()}>
                Speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vorstand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {site.teamMembers.map((m, i) => (
                <div key={m.id} className="grid gap-2 rounded-lg border border-white/10 p-3 sm:grid-cols-2">
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
                    <Label>Rolle</Label>
                    <Input
                      value={m.role}
                      onChange={(e) => {
                        const next = [...site.teamMembers]
                        next[i] = { ...next[i], role: e.target.value }
                        setSite({ ...site, teamMembers: next })
                      }}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Bild-URL</Label>
                    <Input
                      value={m.imageSrc}
                      onChange={(e) => {
                        const next = [...site.teamMembers]
                        next[i] = { ...next[i], imageSrc: e.target.value }
                        setSite({ ...site, teamMembers: next })
                      }}
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
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
                  <div className="h-24 w-20 overflow-hidden rounded border border-white/10 sm:col-span-2">
                    <Image src={m.imageSrc} alt="" width={80} height={96} className="h-full w-full object-cover" unoptimized />
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={site.teamMembers.length >= CMS_LIMITS.maxTeamMembers}
                  onClick={() => {
                    if (site.teamMembers.length >= CMS_LIMITS.maxTeamMembers) {
                      setSaveMsg(`Maximal ${CMS_LIMITS.maxTeamMembers} Team-Einträge.`)
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
                          role: 'Rolle',
                          imageSrc: '/images/team/christoph-schuler.jpg',
                        },
                      ],
                    })
                  }}
                >
                  Mitglied hinzufügen
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={site.teamMembers.length <= 1}
                  onClick={() => setSite({ ...site, teamMembers: site.teamMembers.slice(0, -1) })}
                >
                  Letztes entfernen
                </Button>
              </div>
              <Button type="button" disabled={busy} onClick={() => void saveSite()}>
                Speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Club-Streifen, Highlights (JSON), Galerie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FieldList
                title="Club-Streifen"
                items={site.clubStripImages}
                onChange={(clubStripImages) => setSite({ ...site, clubStripImages })}
                upload={uploadToCms}
                folder="club"
                setBusy={setBusy}
                maxItems={CMS_LIMITS.maxClubStripImages}
                onUploadMessage={setSaveMsg}
              />
              <div>
                <Label>Highlights (JSON — erste = Feature)</Label>
                <Textarea
                  className="mt-2 font-mono text-xs"
                  rows={14}
                  value={JSON.stringify(site.highlights, null, 2)}
                  onChange={(e) => {
                    try {
                      const highlights = JSON.parse(e.target.value) as SiteContent['highlights']
                      setSite({ ...site, highlights })
                    } catch {
                      /* ignore while typing */
                    }
                  }}
                />
              </div>
              <FieldList
                title="Galerie"
                items={site.galleryImages}
                onChange={(galleryImages) => setSite({ ...site, galleryImages })}
                upload={uploadToCms}
                folder="gallery"
                setBusy={setBusy}
                maxItems={CMS_LIMITS.maxGalleryImages}
                onUploadMessage={setSaveMsg}
              />
              <Button type="button" disabled={busy} onClick={() => void saveSite()}>
                Speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="termine" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Termine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {termine.map((t) => (
                <div key={t.id} className="grid gap-2 rounded-lg border border-white/10 p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <Label>Titel</Label>
                      <Input
                        value={t.title}
                        onChange={(e) => setTermine(termine.map((x) => (x.id === t.id ? { ...x, title: e.target.value } : x)))}
                      />
                    </div>
                    <div>
                      <Label>Zeitfenster / Datumstext</Label>
                      <Input
                        value={t.dateStr}
                        onChange={(e) => setTermine(termine.map((x) => (x.id === t.id ? { ...x, dateStr: e.target.value } : x)))}
                      />
                    </div>
                    <div>
                      <Label>Ort</Label>
                      <Input
                        value={t.location}
                        onChange={(e) => setTermine(termine.map((x) => (x.id === t.id ? { ...x, location: e.target.value } : x)))}
                      />
                    </div>
                    <div>
                      <Label>Kategorie</Label>
                      <Input
                        value={t.category ?? ''}
                        onChange={(e) => setTermine(termine.map((x) => (x.id === t.id ? { ...x, category: e.target.value } : x)))}
                      />
                    </div>
                    <div>
                      <Label>Kalenderdatum (YYYY-MM-DD)</Label>
                      <Input
                        value={t.calendarDate ?? ''}
                        onChange={(e) => setTermine(termine.map((x) => (x.id === t.id ? { ...x, calendarDate: e.target.value } : x)))}
                      />
                    </div>
                    <div>
                      <Label>Sortierung (Zahl)</Label>
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
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={t.description ?? ''}
                      onChange={(e) => setTermine(termine.map((x) => (x.id === t.id ? { ...x, description: e.target.value } : x)))}
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
                        } finally {
                          setBusy(false)
                        }
                      }}
                    >
                      Termin speichern
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
                    setSaveMsg(`Maximal ${CMS_LIMITS.maxTermineDocuments} Termine. Bitte bestehende löschen oder zusammenführen.`)
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
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                Neuer Termin
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kontakt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kontakt &amp; Saison</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div>
                <Label>E-Mail</Label>
                <Input value={site.contactEmail} onChange={(e) => setSite({ ...site, contactEmail: e.target.value })} />
              </div>
              <div>
                <Label>Google Maps Such-URL</Label>
                <Input value={site.mapSearchUrl} onChange={(e) => setSite({ ...site, mapSearchUrl: e.target.value })} />
              </div>
              <div>
                <Label>Saison-Label (z.B. Saison 2026)</Label>
                <Input value={site.seasonLabel} onChange={(e) => setSite({ ...site, seasonLabel: e.target.value })} />
              </div>
              <div>
                <Label>Termine-Einleitungstext</Label>
                <Textarea value={site.termineIntro} onChange={(e) => setSite({ ...site, termineIntro: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Übersichtskarten (JSON)</Label>
                <Textarea
                  className="mt-2 font-mono text-xs"
                  rows={8}
                  value={JSON.stringify(site.termineOverviewCards, null, 2)}
                  onChange={(e) => {
                    try {
                      const v = JSON.parse(e.target.value) as SiteContent['termineOverviewCards']
                      setSite({ ...site, termineOverviewCards: v })
                    } catch {
                      /* ignore */
                    }
                  }}
                />
              </div>
              <Button type="button" disabled={busy} onClick={() => void saveSite()}>
                Speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {saveMsg ? <p className="mt-4 text-sm text-rally-muted">{saveMsg}</p> : null}
    </div>
  )
}

function PreviewHero({ site }: { site: SiteContent }) {
  return (
    <div className="rounded-lg border border-dashed border-white/20 p-3">
      <p className="mb-2 text-xs font-semibold text-rally-orange">Vorschau</p>
      <div className="flex gap-2 overflow-x-auto">
        {site.heroSlides.map((s, i) => (
          <div key={i} className="h-24 w-40 shrink-0 overflow-hidden rounded border border-white/10">
            <Image src={s.imageSrc} alt="" width={160} height={96} className="h-full w-full object-cover" unoptimized />
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewSocial({ site }: { site: SiteContent }) {
  return (
    <div className="rounded-lg border border-dashed border-white/20 p-3 text-xs">
      <p className="mb-2 font-semibold text-rally-orange">Vorschau Links</p>
      <ul className="list-inside list-disc space-y-1 text-rally-muted">
        <li>Facebook: {site.social.facebookUrl}</li>
        <li>Instagram: {site.social.instagramUrl || '—'}</li>
        <li>YouTube: {site.social.youtubeUrl || '—'}</li>
      </ul>
    </div>
  )
}

type StripItem = { src: string; alt: string }

function FieldList({
  title,
  items,
  onChange,
  upload,
  folder,
  setBusy,
  maxItems,
  onUploadMessage,
}: {
  title: string
  items: StripItem[]
  onChange: (next: StripItem[]) => void
  upload: (file: File, folder: string) => Promise<string>
  folder: string
  setBusy: (v: boolean) => void
  maxItems: number
  onUploadMessage: (msg: string | null) => void
}) {
  const rows = items.length ? items : [{ src: '', alt: '' }]

  return (
    <div className="space-y-2">
      <p className="font-display text-sm font-bold text-white">{title}</p>
      {rows.map((row, i) => (
        <div key={i} className="flex flex-wrap items-end gap-2 rounded border border-white/10 p-2">
          <Input
            className="max-w-[220px]"
            placeholder="URL"
            value={row.src}
            onChange={(e) => {
              const next = [...rows]
              next[i] = { ...next[i], src: e.target.value }
              onChange(next)
            }}
          />
          <Input
            className="max-w-[180px]"
            placeholder="Alt"
            value={row.alt}
            onChange={(e) => {
              const next = [...rows]
              next[i] = { ...next[i], alt: e.target.value }
              onChange(next)
            }}
          />
          <input
            type="file"
            accept="image/*"
            className="max-w-[200px] text-[10px]"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              onUploadMessage(null)
              setBusy(true)
              try {
                const url = await upload(f, folder)
                const next = [...rows]
                next[i] = { ...next[i], src: url }
                onChange(next)
              } catch (err) {
                onUploadMessage(err instanceof Error ? err.message : 'Upload fehlgeschlagen')
              } finally {
                setBusy(false)
              }
            }}
          />
        </div>
      ))}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={items.length >= maxItems}
          onClick={() => {
            if (items.length >= maxItems) {
              onUploadMessage(`Limit: maximal ${maxItems} Bilder bei „${title}".`)
              return
            }
            onUploadMessage(null)
            onChange([...rows, { src: '', alt: '' }])
          }}
        >
          Zeile +
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={rows.length <= 1} onClick={() => onChange(rows.slice(0, -1))}>
          Zeile −
        </Button>
      </div>
    </div>
  )
}
