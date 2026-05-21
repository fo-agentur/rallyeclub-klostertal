"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

export type GraphMember = {
  id: string;
  name: string;
  role?: string | null;
  group_label: string;
  photo?: string | null;
  is_driver?: boolean;
};

type NodeKind = "center" | "group" | "person";
type SimNode = {
  id: string;
  kind: NodeKind;
  label: string;
  sublabel?: string;
  group: string;
  photo?: string | null;
  is_driver?: boolean;
  // physics
  x: number;
  y: number;
  vx: number;
  vy: number;
  // visual
  r: number;
  fixed?: boolean;
};
type SimEdge = { a: string; b: string; kind: "hub" | "family" | "role" };

const W = 1100;
const H = 720;
const CENTER = { x: W / 2, y: H / 2 };
const GROUP_COLOR: Record<string, string> = {
  Vorstand: "#E10600",
  Ehrenmitglieder: "#D4A23A",
  Mitglieder: "#2E2E2E",
};

function familyKey(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1].toLowerCase();
}

function buildGraph(members: GraphMember[]): { nodes: SimNode[]; edges: SimEdge[] } {
  const groups = Array.from(new Set(members.map((m) => m.group_label)));
  const groupOrder = ["Vorstand", "Ehrenmitglieder", "Mitglieder"].filter((g) => groups.includes(g));
  const extra = groups.filter((g) => !groupOrder.includes(g));
  const orderedGroups = [...groupOrder, ...extra];

  const nodes: SimNode[] = [];
  const edges: SimEdge[] = [];

  // Central hub
  nodes.push({
    id: "rck",
    kind: "center",
    label: "RCK",
    sublabel: "seit 1988",
    group: "center",
    x: CENTER.x,
    y: CENTER.y,
    vx: 0,
    vy: 0,
    r: 46,
    fixed: true,
  });

  // Group hubs around center
  const ringR = 220;
  orderedGroups.forEach((g, i) => {
    const a = (i / orderedGroups.length) * Math.PI * 2 - Math.PI / 2;
    nodes.push({
      id: `group:${g}`,
      kind: "group",
      label: g,
      group: g,
      x: CENTER.x + Math.cos(a) * ringR,
      y: CENTER.y + Math.sin(a) * ringR,
      vx: 0,
      vy: 0,
      r: 34,
    });
    edges.push({ a: "rck", b: `group:${g}`, kind: "hub" });
  });

  // Person nodes around their group hub
  orderedGroups.forEach((g) => {
    const groupHubId = `group:${g}`;
    const groupHub = nodes.find((n) => n.id === groupHubId)!;
    const peeps = members.filter((m) => m.group_label === g);
    peeps.forEach((p, idx) => {
      const a = (idx / peeps.length) * Math.PI * 2;
      const dist = 130 + (idx % 3) * 18;
      nodes.push({
        id: p.id,
        kind: "person",
        label: p.name,
        sublabel: p.role ?? undefined,
        group: g,
        photo: p.photo,
        is_driver: p.is_driver,
        x: groupHub.x + Math.cos(a) * dist + (Math.random() - 0.5) * 20,
        y: groupHub.y + Math.sin(a) * dist + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
        r: 22,
      });
      edges.push({ a: groupHubId, b: p.id, kind: "hub" });
    });
  });

  // Family edges (people sharing surname)
  const byFamily = new Map<string, string[]>();
  for (const m of members) {
    const k = familyKey(m.name);
    if (!byFamily.has(k)) byFamily.set(k, []);
    byFamily.get(k)!.push(m.id);
  }
  for (const ids of byFamily.values()) {
    if (ids.length < 2) continue;
    for (let i = 0; i < ids.length - 1; i++) {
      edges.push({ a: ids[i], b: ids[i + 1], kind: "family" });
    }
  }

  // Role edges (people sharing the same role)
  const byRole = new Map<string, string[]>();
  for (const m of members) {
    if (!m.role) continue;
    const key = m.role.toLowerCase();
    if (!byRole.has(key)) byRole.set(key, []);
    byRole.get(key)!.push(m.id);
  }
  for (const ids of byRole.values()) {
    if (ids.length < 2) continue;
    for (let i = 0; i < ids.length - 1; i++) {
      edges.push({ a: ids[i], b: ids[i + 1], kind: "role" });
    }
  }

  return { nodes, edges };
}

function relax(nodes: SimNode[], edges: SimEdge[], iterations = 220) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const REP = 5200;
  const SPRING = 0.018;
  const GRAVITY = 0.0035;
  const DAMP = 0.82;
  const MAX_V = 18;

  const targetLen = (e: SimEdge): number => {
    if (e.kind === "hub") {
      const a = byId.get(e.a)!;
      const b = byId.get(e.b)!;
      if (a.kind === "center" || b.kind === "center") return 220;
      return 120;
    }
    return 110;
  };

  for (let it = 0; it < iterations; it++) {
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      if (a.fixed) continue;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 0.01) {
          dx = Math.random() - 0.5;
          dy = Math.random() - 0.5;
          d2 = 0.01;
        }
        const d = Math.sqrt(d2);
        const f = REP / d2;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        a.vx += fx;
        a.vy += fy;
        if (!b.fixed) {
          b.vx -= fx;
          b.vy -= fy;
        }
      }
    }

    // Spring forces along edges
    for (const e of edges) {
      const a = byId.get(e.a);
      const b = byId.get(e.b);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const diff = d - targetLen(e);
      const force = diff * SPRING * (e.kind === "hub" ? 1 : 0.55);
      const fx = (dx / d) * force;
      const fy = (dy / d) * force;
      if (!a.fixed) {
        a.vx += fx;
        a.vy += fy;
      }
      if (!b.fixed) {
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    // Center gravity + integrate
    for (const n of nodes) {
      if (n.fixed) {
        n.vx = 0;
        n.vy = 0;
        continue;
      }
      n.vx += (CENTER.x - n.x) * GRAVITY;
      n.vy += (CENTER.y - n.y) * GRAVITY;
      n.vx *= DAMP;
      n.vy *= DAMP;
      // clamp velocity
      const v = Math.hypot(n.vx, n.vy);
      if (v > MAX_V) {
        n.vx = (n.vx / v) * MAX_V;
        n.vy = (n.vy / v) * MAX_V;
      }
      n.x += n.vx;
      n.y += n.vy;
      // bounds
      const pad = 60;
      n.x = Math.max(pad, Math.min(W - pad, n.x));
      n.y = Math.max(pad, Math.min(H - pad, n.y));
    }
  }
}

export function MemberGraph({ members }: { members: GraphMember[] }) {
  const { nodes, edges } = useMemo(() => {
    const g = buildGraph(members);
    relax(g.nodes, g.edges);
    return g;
  }, [members]);

  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const active = selected ?? hover;
  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const neighbors = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const e of edges) {
      if (!m.has(e.a)) m.set(e.a, new Set());
      if (!m.has(e.b)) m.set(e.b, new Set());
      m.get(e.a)!.add(e.b);
      m.get(e.b)!.add(e.a);
    }
    return m;
  }, [edges]);

  const isHighlighted = (id: string): boolean => {
    if (!active) return true;
    if (id === active) return true;
    return neighbors.get(active)?.has(id) ?? false;
  };

  const isEdgeHighlighted = (e: SimEdge): boolean => {
    if (!active) return true;
    return e.a === active || e.b === active;
  };

  const selectedNode = selected ? nodeById.get(selected) : null;

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden rounded-[28px] border border-white/10 bg-ink"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelected(null);
      }}
    >
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.25) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />
      {/* Racing corner accent */}
      <div className="race-corner top-right hidden sm:block" aria-hidden />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="relative block h-auto w-full"
        role="img"
        aria-label="Mitglieder-Netzwerk des Rallyeclub Klostertal"
      >
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E10600" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#E10600" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#E10600" stopOpacity="0" />
          </radialGradient>
          {Object.entries(GROUP_COLOR).map(([g, c]) => (
            <radialGradient key={g} id={`glow-${g}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity="0.55" />
              <stop offset="100%" stopColor={c} stopOpacity="0" />
            </radialGradient>
          ))}
          <clipPath id="circleClip">
            <circle cx="0" cy="0" r="20" />
          </clipPath>
        </defs>

        {/* Center glow */}
        <circle cx={CENTER.x} cy={CENTER.y} r="160" fill="url(#centerGlow)" />

        {/* Edges */}
        <g>
          {edges.map((e, i) => {
            const a = nodeById.get(e.a);
            const b = nodeById.get(e.b);
            if (!a || !b) return null;
            const on = isEdgeHighlighted(e);
            const baseOpacity = e.kind === "hub" ? 0.35 : e.kind === "family" ? 0.55 : 0.45;
            const color =
              e.kind === "family"
                ? "#D4A23A"
                : e.kind === "role"
                  ? "#E10600"
                  : "#ffffff";
            return (
              <line
                key={`e${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={color}
                strokeWidth={e.kind === "hub" ? 1 : 1.4}
                strokeDasharray={e.kind === "role" ? "4 4" : undefined}
                style={{
                  opacity: mounted ? (on ? baseOpacity + 0.25 : baseOpacity * 0.35) : 0,
                  transition: "opacity 600ms ease",
                }}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map((n) => {
            const color =
              n.kind === "center"
                ? "#E10600"
                : GROUP_COLOR[n.group] ?? "#888";
            const hi = isHighlighted(n.id);
            const isActive = active === n.id;
            const r = n.r * (isActive ? 1.18 : 1);
            return (
              <g
                key={n.id}
                style={{
                  transform: `translate(${n.x}px, ${n.y}px)`,
                  transition: "transform 700ms cubic-bezier(0.22,1,0.36,1), opacity 400ms ease",
                  opacity: mounted ? (hi ? 1 : 0.18) : 0,
                  cursor: n.kind === "person" ? "pointer" : "default",
                }}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (n.kind === "person") {
                    setSelected((s) => (s === n.id ? null : n.id));
                  }
                }}
              >
                {/* Halo */}
                {n.kind !== "person" && (
                  <circle r={r + 26} fill={`url(#glow-${n.group === "center" ? "Vorstand" : n.group})`} />
                )}
                {/* Outer ring for drivers */}
                {n.is_driver && (
                  <circle r={r + 4} fill="none" stroke="#E10600" strokeWidth="1.5" opacity="0.85" />
                )}

                {n.kind === "person" && n.photo ? (
                  <>
                    <circle r={r} fill={color} opacity="0.18" />
                    <circle r={r} fill="#0A0A0A" />
                    <g transform={`translate(-${r} -${r})`}>
                      <foreignObject x="0" y="0" width={r * 2} height={r * 2}>
                        <div
                          style={{
                            width: r * 2,
                            height: r * 2,
                            borderRadius: "9999px",
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={n.photo}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "center 22%",
                            }}
                          />
                        </div>
                      </foreignObject>
                    </g>
                    <circle r={r} fill="none" stroke={color} strokeWidth="1.5" opacity="0.9" />
                  </>
                ) : (
                  <>
                    <circle r={r} fill={color} opacity={n.kind === "center" ? 1 : 0.22} />
                    <circle r={r} fill="none" stroke={color} strokeWidth="1.5" opacity="0.95" />
                  </>
                )}

                {/* Label */}
                {n.kind === "center" && (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#fff"
                    fontFamily="var(--font-bebas), Impact, sans-serif"
                    fontSize="22"
                    letterSpacing="2"
                  >
                    {n.label}
                  </text>
                )}
                {n.kind === "group" && (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#fff"
                    fontFamily="var(--font-bebas), Impact, sans-serif"
                    fontSize="14"
                    letterSpacing="1.5"
                  >
                    {n.label.toUpperCase()}
                  </text>
                )}
                {n.kind === "person" && !n.photo && (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#fff"
                    fontFamily="var(--font-bebas), Impact, sans-serif"
                    fontSize="12"
                    letterSpacing="1"
                  >
                    {n.label
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </text>
                )}

                {/* Tooltip name on hover (person only) */}
                {n.kind === "person" && isActive && (
                  <g>
                    <rect
                      x={-Math.max(60, n.label.length * 4.2)}
                      y={r + 8}
                      width={Math.max(120, n.label.length * 8.4)}
                      height="34"
                      rx="6"
                      fill="#0A0A0A"
                      stroke={color}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y={r + 24}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="11"
                      fontWeight="700"
                    >
                      {n.label}
                    </text>
                    {n.sublabel && (
                      <text
                        x="0"
                        y={r + 36}
                        textAnchor="middle"
                        fill="#E10600"
                        fontSize="9"
                        letterSpacing="1"
                      >
                        {n.sublabel.toUpperCase()}
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 sm:bottom-4 sm:left-5 sm:right-5">
        {Object.entries(GROUP_COLOR).map(([g, c]) => (
          <span key={g} className="inline-flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: c }} />
            {g}
          </span>
        ))}
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-[2px] w-5" style={{ background: "#D4A23A" }} />
          Familie
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-[2px] w-5"
            style={{
              background:
                "repeating-linear-gradient(90deg, #E10600 0 4px, transparent 4px 8px)",
            }}
          />
          Rolle
        </span>
      </div>

      {/* Selected person detail card */}
      {selectedNode && selectedNode.kind === "person" && (
        <div
          className="absolute right-3 top-3 z-10 max-w-[260px] rounded-2xl border border-white/15 bg-ink/95 p-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.4)] backdrop-blur-sm sm:right-5 sm:top-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            {selectedNode.photo ? (
              <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/10">
                <Image
                  src={selectedNode.photo}
                  alt={selectedNode.label}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </span>
            ) : (
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: GROUP_COLOR[selectedNode.group] ?? "#444" }}
              >
                {selectedNode.label
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)}
              </span>
            )}
            <div className="min-w-0">
              <div className="truncate font-display text-lg leading-tight tracking-wider">
                {selectedNode.label}
              </div>
              {selectedNode.sublabel && (
                <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-racing">
                  {selectedNode.sublabel}
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
            {selectedNode.group}
            {selectedNode.is_driver ? " · Aktiver Fahrer" : ""}
          </div>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55 hover:text-racing"
          >
            ✕ Schließen
          </button>
        </div>
      )}
    </div>
  );
}
