'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CMS_LIMITS } from '@/lib/cms-limits'
import type { SiteContent, HighlightCard, TermineOverviewCard } from '@/lib/schemas/site-content'

const selectClass =
  'flex h-10 w-full rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-rally-orange/60'

export function normalizeHighlightVariants(highlights: HighlightCard[]): HighlightCard[] {
  return highlights.map((h, i) => ({
    ...h,
    variant: i === 0 ? 'feature' : 'default',
  }))
}

function emptyHighlight(): HighlightCard {
  return {
    variant: 'default',
    imageSrc: '/images/headers/1.png',
    alt: '',
    tag: 'Event',
    title: 'Neues Highlight',
    description: '',
    eyebrow: '',
  }
}

interface HighlightsEditorProps {
  highlights: HighlightCard[]
  onChange: (next: HighlightCard[]) => void
  upload: (file: File, folder: string) => Promise<string>
  setBusy: (v: boolean) => void
  onMessage: (msg: string | null) => void
}

export function HighlightsEditor({ highlights, onChange, upload, setBusy, onMessage }: HighlightsEditorProps) {
  const rows = highlights.length ? highlights : [emptyHighlight()]

  const patch = (i: number, partial: Partial<HighlightCard>) => {
    const next = [...rows]
    next[i] = { ...next[i], ...partial }
    onChange(normalizeHighlightVariants(next))
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-white">Highlights &amp; Events</p>
      <p className="text-xs text-rally-muted">
        Das <strong className="text-white">erste</strong> Highlight erscheint groß oben. Bilder per Button wählen — kein Code nötig.
      </p>
      {rows.map((h, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-rally-orange">
            {i === 0 ? 'Haupt-Highlight (groß)' : `Highlight ${i + 1}`}
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="h-24 w-36 overflow-hidden rounded-md border border-white/10">
              <Image src={h.imageSrc} alt="" width={144} height={96} className="h-full w-full object-cover" unoptimized />
            </div>
            <div>
              <Label className="text-xs">Bild hochladen</Label>
              <input
                type="file"
                accept="image/*"
                className="mt-1 block max-w-[220px] text-xs text-rally-muted file:mr-2 file:rounded file:border-0 file:bg-rally-orange/20 file:px-2 file:py-1 file:text-xs file:text-white"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  onMessage(null)
                  setBusy(true)
                  try {
                    const url = await upload(f, 'highlights')
                    patch(i, { imageSrc: url })
                  } catch (err) {
                    onMessage(err instanceof Error ? err.message : 'Upload fehlgeschlagen')
                  } finally {
                    setBusy(false)
                  }
                }}
              />
            </div>
          </div>
          <details className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs">
            <summary className="cursor-pointer font-medium text-rally-muted">Bild-Link manuell ändern (optional)</summary>
            <Input
              className="mt-2"
              value={h.imageSrc}
              onChange={(e) => patch(i, { imageSrc: e.target.value })}
            />
          </details>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Kurzzeile über dem Titel (optional)</Label>
              <Input value={h.eyebrow ?? ''} onChange={(e) => patch(i, { eyebrow: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Stichwort / Tag</Label>
              <Input value={h.tag} onChange={(e) => patch(i, { tag: e.target.value })} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Titel</Label>
            <Input value={h.title} onChange={(e) => patch(i, { title: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Beschreibung</Label>
            <Textarea rows={3} value={h.description} onChange={(e) => patch(i, { description: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Bildbeschreibung (für Barrierefreiheit)</Label>
            <Input value={h.alt} onChange={(e) => patch(i, { alt: e.target.value })} />
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={rows.length >= CMS_LIMITS.maxHighlightCards}
          onClick={() => {
            if (rows.length >= CMS_LIMITS.maxHighlightCards) {
              onMessage(`Maximal ${CMS_LIMITS.maxHighlightCards} Highlights.`)
              return
            }
            onMessage(null)
            onChange(normalizeHighlightVariants([...rows, emptyHighlight()]))
          }}
        >
          Weiteres Highlight hinzufügen
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={rows.length <= 1}
          onClick={() => onChange(normalizeHighlightVariants(rows.slice(0, -1)))}
        >
          Letztes entfernen
        </Button>
      </div>
    </div>
  )
}

function emptyOverviewCard(): TermineOverviewCard {
  return {
    windowLabel: 'Zeitfenster',
    windowValue: '2026',
    title: 'Neuer Eintrag',
    subtitle: '',
    badge: 'Club',
    badgeTone: 'muted',
  }
}

interface TermineOverviewEditorProps {
  cards: SiteContent['termineOverviewCards']
  onChange: (next: SiteContent['termineOverviewCards']) => void
}

export function TermineOverviewEditor({ cards, onChange }: TermineOverviewEditorProps) {
  const rows = cards.length ? cards : [emptyOverviewCard()]

  const patch = (i: number, partial: Partial<TermineOverviewCard>) => {
    const next = [...rows]
    next[i] = { ...next[i], ...partial }
    onChange(next)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-white">Termine — Karten „Auf einen Blick“</p>
      <p className="text-xs text-rally-muted">Die drei kleinen Karten im Termin-Bereich (ohne technischen Text).</p>
      {rows.map((c, i) => (
        <div key={i} className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs">Zeile oben (z. B. „Zeitfenster“)</Label>
            <Input value={c.windowLabel} onChange={(e) => patch(i, { windowLabel: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Datum / Zeitraum</Label>
            <Input value={c.windowValue} onChange={(e) => patch(i, { windowValue: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Titel</Label>
            <Input value={c.title} onChange={(e) => patch(i, { title: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Untertitel / Ort</Label>
            <Input value={c.subtitle} onChange={(e) => patch(i, { subtitle: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Badge-Text</Label>
            <Input value={c.badge} onChange={(e) => patch(i, { badge: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Badge-Farbe</Label>
            <select
              className={selectClass}
              value={c.badgeTone}
              onChange={(e) => patch(i, { badgeTone: e.target.value as 'accent' | 'muted' })}
            >
              <option value="accent">Orange (betont)</option>
              <option value="muted">Zurückhaltend</option>
            </select>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" disabled={rows.length >= 6} onClick={() => onChange([...rows, emptyOverviewCard()])}>
          Karte hinzufügen
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={rows.length <= 1} onClick={() => onChange(rows.slice(0, -1))}>
          Letzte Karte entfernen
        </Button>
      </div>
    </div>
  )
}

type StripItem = { src: string; alt: string }

interface SimpleImageRowsProps {
  title: string
  hint?: string
  items: StripItem[]
  onChange: (next: StripItem[]) => void
  folder: string
  upload: (file: File, folder: string) => Promise<string>
  setBusy: (v: boolean) => void
  maxItems: number
  onMessage: (msg: string | null) => void
}

export function SimpleImageRows({
  title,
  hint,
  items,
  onChange,
  folder,
  upload,
  setBusy,
  maxItems,
  onMessage,
}: SimpleImageRowsProps) {
  const rows = items.length ? items : [{ src: '', alt: '' }]

  const patchRow = (i: number, partial: Partial<StripItem>) => {
    const next = [...rows]
    next[i] = { ...next[i], ...partial }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        {hint ? <p className="mt-1 text-xs text-rally-muted">{hint}</p> : null}
      </div>
      {rows.map((row, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-20 w-28 overflow-hidden rounded-md border border-white/10 bg-black/30">
              {row.src ? (
                <Image src={row.src} alt="" width={112} height={80} className="h-full w-full object-cover" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-rally-muted">Kein Bild</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs">Bild hochladen</Label>
              <input
                type="file"
                accept="image/*"
                className="max-w-[200px] text-[11px] text-rally-muted file:mr-2 file:rounded file:border-0 file:bg-rally-orange/20 file:px-2 file:py-1 file:text-white"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  onMessage(null)
                  setBusy(true)
                  try {
                    const url = await upload(f, folder)
                    patchRow(i, { src: url })
                  } catch (err) {
                    onMessage(err instanceof Error ? err.message : 'Upload fehlgeschlagen')
                  } finally {
                    setBusy(false)
                  }
                }}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Kurzbeschreibung fürs Bild (Alt-Text)</Label>
            <Input value={row.alt} onChange={(e) => patchRow(i, { alt: e.target.value })} placeholder="z. B. Autoslalom Impression" />
          </div>
          <details className="text-xs">
            <summary className="cursor-pointer text-rally-muted">Bild-Link bearbeiten (optional)</summary>
            <Input className="mt-2" value={row.src} onChange={(e) => patchRow(i, { src: e.target.value })} />
          </details>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={items.length >= maxItems}
          onClick={() => {
            if (items.length >= maxItems) {
              onMessage(`Maximal ${maxItems} Bilder.`)
              return
            }
            onMessage(null)
            onChange([...rows, { src: '', alt: '' }])
          }}
        >
          Bild hinzufügen
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={rows.length <= 1} onClick={() => onChange(rows.slice(0, -1))}>
          Letztes entfernen
        </Button>
      </div>
    </div>
  )
}
