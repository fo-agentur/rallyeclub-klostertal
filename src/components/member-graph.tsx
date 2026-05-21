"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

export type GraphMember = {
  id: string;
  name: string;
  role?: string | null;
  group_label: string;
  photo?: string | null;
  is_driver?: boolean;
  anchorId?: string;
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
  anchorId?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  fixed?: boolean;
};

type SimEdge = { a: string; b: string; kind: "hub" | "family" | "role" };
type ViewState = { x: number; y: number; scale: number };
type DragState =
  | {
      type: "node";
      pointerId: number;
      id: string;
      offsetX: number;
      offsetY: number;
      startPositions: Record<string, { x: number; y: number }>;
      influence: Record<string, number>;
    }
  | {
      type: "pan";
      pointerId: number;
      startX: number;
      startY: number;
      viewX: number;
      viewY: number;
    }
  | null;

const W = 1180;
const H = 720;
const CENTER = { x: W / 2, y: H / 2 };
const MIN_SCALE = 0.72;
const MAX_SCALE = 1.72;
const GROUP_STYLE: Record<string, { color: string; muted: string; short: string }> = {
  center: { color: "#F04438", muted: "#2A0807", short: "RCK" },
  Vorstand: { color: "#F04438", muted: "#35100F", short: "VST" },
  Ehrenmitglieder: { color: "#D7A84A", muted: "#33260C", short: "EHR" },
  Mitglieder: { color: "#D8DEE8", muted: "#1C222B", short: "MIT" },
};

const GROUP_ANCHORS: Record<string, { x: number; y: number }> = {
  Vorstand: { x: 770, y: 238 },
  Mitglieder: { x: 402, y: 466 },
  Ehrenmitglieder: { x: 844, y: 522 },
};

function getGroupStyle(group: string) {
  return GROUP_STYLE[group] ?? { color: "#9CA3AF", muted: "#1F2937", short: group.slice(0, 3) };
}

function groupAnchor(group: string, index: number, total: number): { x: number; y: number } {
  const anchored = GROUP_ANCHORS[group];
  if (anchored) return anchored;

  const angle = (index / Math.max(1, total)) * Math.PI * 2 - Math.PI / 2;
  return {
    x: CENTER.x + Math.cos(angle) * 235,
    y: CENTER.y + Math.sin(angle) * 215,
  };
}

function ringCapacities(group: string, total: number): number[] {
  const template = group === "Mitglieder" ? [8, 13, 18, 24] : [5, 8, 12];
  const rings: number[] = [];
  let remaining = total;

  for (const capacity of template) {
    if (remaining <= 0) break;
    const next = Math.min(capacity, remaining);
    rings.push(next);
    remaining -= next;
  }

  if (remaining > 0) rings.push(remaining);
  return rings;
}

function clusterRadius(group: string, ringIndex: number): number {
  const radii =
    group === "Mitglieder"
      ? [104, 166, 222, 276]
      : group === "Vorstand"
        ? [94, 148, 194]
        : [92, 144, 190];

  return radii[Math.min(ringIndex, radii.length - 1)] + Math.max(0, ringIndex - radii.length + 1) * 42;
}

function clusterRadiusForGroup(group: string, total: number): number {
  const rings = ringCapacities(group, total);
  return clusterRadius(group, Math.max(0, rings.length - 1)) + 54;
}

function clusterPosition(
  groupHub: SimNode,
  group: string,
  index: number,
  total: number,
  id: string,
): { x: number; y: number } {
  const rings = ringCapacities(group, total);
  let start = 0;
  let ringIndex = 0;

  for (let i = 0; i < rings.length; i++) {
    if (index < start + rings[i]) {
      ringIndex = i;
      break;
    }
    start += rings[i];
  }

  const ringCount = rings[ringIndex] ?? total;
  const position = index - start;
  const phase =
    group === "Vorstand" ? -2.25 : group === "Ehrenmitglieder" ? 0.32 : 2.08;
  const angle =
    phase + (position / Math.max(1, ringCount)) * Math.PI * 2 + ringIndex * 0.22 + jitter(id, 0.08);
  const radius = clusterRadius(group, ringIndex);

  return {
    x: groupHub.x + Math.cos(angle) * radius + jitter(`${id}:x`, 8),
    y: groupHub.y + Math.sin(angle) * radius + jitter(`${id}:y`, 8),
  };
}

function familyKey(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1].toLowerCase();
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function jitter(value: string, amount: number): number {
  return ((hashString(value) % 1000) / 1000 - 0.5) * amount;
}

function safeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, (char) => `-${char.charCodeAt(0).toString(16)}-`);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundCoord(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatCoord(value: number): string {
  return roundCoord(value).toString();
}

function cloneNodes(nodes: SimNode[]) {
  return nodes.map((node) => ({ ...node }));
}

function buildGraph(members: GraphMember[]): { nodes: SimNode[]; edges: SimEdge[] } {
  const groups = Array.from(new Set(members.map((member) => member.group_label)));
  const groupOrder = ["Vorstand", "Ehrenmitglieder", "Mitglieder"].filter((group) =>
    groups.includes(group),
  );
  const orderedGroups = [...groupOrder, ...groups.filter((group) => !groupOrder.includes(group))];
  const nodes: SimNode[] = [];
  const edges: SimEdge[] = [];

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
    r: 42,
    fixed: true,
  });

  orderedGroups.forEach((group, index) => {
    const id = `group:${group}`;
    const anchor = groupAnchor(group, index, orderedGroups.length);
    nodes.push({
      id,
      kind: "group",
      label: group,
      group,
      x: anchor.x,
      y: anchor.y,
      vx: 0,
      vy: 0,
      r: 37,
      fixed: true,
    });
    edges.push({ a: "rck", b: id, kind: "hub" });
  });

  orderedGroups.forEach((group, groupIndex) => {
    const groupHubId = `group:${group}`;
    const groupHub = nodes.find((node) => node.id === groupHubId);
    if (!groupHub) return;

    const people = members.filter((member) => member.group_label === group);
    const sortedPeople = [...people].sort((a, b) => {
      if (!!a.role !== !!b.role) return a.role ? -1 : 1;
      return a.name.localeCompare(b.name, "de");
    });
    sortedPeople.forEach((person, index) => {
      const position = clusterPosition(groupHub, group, index, sortedPeople.length, person.id);
      nodes.push({
        id: person.id,
        kind: "person",
        label: person.name,
        sublabel: person.role ?? undefined,
        group,
        photo: person.photo,
        is_driver: person.is_driver,
        anchorId: person.anchorId,
        x: position.x,
        y: position.y,
        vx: 0,
        vy: 0,
        r: person.photo ? 23 : 21,
      });
      edges.push({ a: groupHubId, b: person.id, kind: "hub" });
    });
  });

  const byFamily = new Map<string, string[]>();
  for (const member of members) {
    const key = familyKey(member.name);
    if (!byFamily.has(key)) byFamily.set(key, []);
    byFamily.get(key)!.push(member.id);
  }

  for (const ids of byFamily.values()) {
    if (ids.length < 2) continue;
    for (let index = 0; index < ids.length - 1; index++) {
      edges.push({ a: ids[index], b: ids[index + 1], kind: "family" });
    }
  }

  const byRole = new Map<string, string[]>();
  for (const member of members) {
    if (!member.role) continue;
    const key = member.role.toLowerCase();
    if (!byRole.has(key)) byRole.set(key, []);
    byRole.get(key)!.push(member.id);
  }

  for (const ids of byRole.values()) {
    if (ids.length < 2) continue;
    for (let index = 0; index < ids.length - 1; index++) {
      edges.push({ a: ids[index], b: ids[index + 1], kind: "role" });
    }
  }

  return { nodes, edges };
}

function settle(nodes: SimNode[], edges: SimEdge[], iterations = 260) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const repulsion = 5000;
  const spring = 0.019;
  const gravity = 0.0008;
  const groupPull = 0.0046;
  const damping = 0.82;
  const maxVelocity = 12;

  const targetLength = (edge: SimEdge): number => {
    if (edge.kind === "family") return 112;
    if (edge.kind === "role") return 126;
    const a = byId.get(edge.a);
    const b = byId.get(edge.b);
    if (a?.kind === "center" || b?.kind === "center") return 248;
    const person = a?.kind === "person" ? a : b?.kind === "person" ? b : null;
    if (person?.group === "Mitglieder") return 148;
    if (person?.group === "Vorstand") return 126;
    return 120;
  };

  for (let iteration = 0; iteration < iterations; iteration++) {
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        if (a.fixed && b.fixed) continue;

        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < 0.01) {
          dx = jitter(`${a.id}:${b.id}:x`, 1);
          dy = jitter(`${a.id}:${b.id}:y`, 1);
          distanceSquared = dx * dx + dy * dy || 0.01;
        }

        const distance = Math.sqrt(distanceSquared);
        const minDistance = a.r + b.r + 22;
        const collision = distance < minDistance ? (minDistance - distance) * 0.09 : 0;
        const force = repulsion / distanceSquared + collision;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        if (!a.fixed) {
          a.vx += fx;
          a.vy += fy;
        }
        if (!b.fixed) {
          b.vx -= fx;
          b.vy -= fy;
        }
      }
    }

    for (const edge of edges) {
      const a = byId.get(edge.a);
      const b = byId.get(edge.b);
      if (!a || !b) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      const edgeWeight = edge.kind === "hub" ? 1 : 0.44;
      const force = (distance - targetLength(edge)) * spring * edgeWeight;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      if (!a.fixed) {
        a.vx += fx;
        a.vy += fy;
      }
      if (!b.fixed) {
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    for (const node of nodes) {
      if (node.fixed) {
        node.vx = 0;
        node.vy = 0;
        continue;
      }

      if (node.kind === "person") {
        const groupHub = byId.get(`group:${node.group}`);
        if (groupHub) {
          node.vx += (groupHub.x - node.x) * groupPull;
          node.vy += (groupHub.y - node.y) * groupPull;
        }
      }

      node.vx += (CENTER.x - node.x) * gravity;
      node.vy += (CENTER.y - node.y) * gravity;
      node.vx *= damping;
      node.vy *= damping;

      const velocity = Math.hypot(node.vx, node.vy);
      if (velocity > maxVelocity) {
        node.vx = (node.vx / velocity) * maxVelocity;
        node.vy = (node.vy / velocity) * maxVelocity;
      }

      node.x = clamp(node.x + node.vx, 62, W - 62);
      node.y = clamp(node.y + node.vy, 66, H - 66);
    }
  }

  for (const node of nodes) {
    node.x = roundCoord(node.x);
    node.y = roundCoord(node.y);
  }
}

function groupShortLabel(group: string): string {
  return getGroupStyle(group).short.toUpperCase();
}

function edgePath(edge: SimEdge, a: SimNode, b: SimNode): string {
  if (edge.kind === "hub") {
    return `M ${formatCoord(a.x)} ${formatCoord(a.y)} L ${formatCoord(b.x)} ${formatCoord(b.y)}`;
  }

  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const direction = edge.kind === "family" ? 1 : -1;
  const offset = direction * 26;
  const cx = mx + (-dy / length) * offset;
  const cy = my + (dx / length) * offset;
  return `M ${formatCoord(a.x)} ${formatCoord(a.y)} Q ${formatCoord(cx)} ${formatCoord(
    cy,
  )} ${formatCoord(b.x)} ${formatCoord(b.y)}`;
}

function dragStrength(edge: SimEdge, from: SimNode, to: SimNode): number {
  if (to.fixed && to.kind === "center" && from.kind !== "center") return 0;
  if (edge.kind === "family") return 0.78;
  if (edge.kind === "role") return 0.58;
  if (from.kind === "center" || to.kind === "center") return 0.24;
  if (from.kind === "group" && to.kind === "person") return 0.58;
  if (from.kind === "person" && to.kind === "group") return 0.66;
  return 0.52;
}

function buildDragInfluence(sourceId: string, nodes: SimNode[], edges: SimEdge[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const adjacency = new Map<string, Array<{ id: string; edge: SimEdge }>>();
  for (const edge of edges) {
    if (!adjacency.has(edge.a)) adjacency.set(edge.a, []);
    if (!adjacency.has(edge.b)) adjacency.set(edge.b, []);
    adjacency.get(edge.a)!.push({ id: edge.b, edge });
    adjacency.get(edge.b)!.push({ id: edge.a, edge });
  }

  const influence: Record<string, number> = { [sourceId]: 1 };
  const queue: Array<{ id: string; value: number }> = [{ id: sourceId, value: 1 }];

  for (let cursor = 0; cursor < queue.length; cursor++) {
    const current = queue[cursor];
    const from = byId.get(current.id);
    if (!from) continue;

    for (const next of adjacency.get(current.id) ?? []) {
      const to = byId.get(next.id);
      if (!to) continue;

      const nextValue = current.value * dragStrength(next.edge, from, to);
      if (nextValue < 0.09 || nextValue <= (influence[next.id] ?? 0)) continue;

      influence[next.id] = nextValue;
      queue.push({ id: next.id, value: nextValue });
    }
  }

  return influence;
}

export function MemberGraph({ members }: { members: GraphMember[] }) {
  const graph = useMemo(() => {
    const nextGraph = buildGraph(members);
    settle(nextGraph.nodes, nextGraph.edges);
    return nextGraph;
  }, [members]);

  const [nodes, setNodes] = useState<SimNode[]>(() => cloneNodes(graph.nodes));
  const [view, setView] = useState<ViewState>({ x: 0, y: 0, scale: 1 });
  const [drag, setDrag] = useState<DragState>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    setNodes(cloneNodes(graph.nodes));
    setView({ x: 0, y: 0, scale: 1 });
    setSelected(null);
    setHover(null);
  }, [graph]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setMounted(true), 80);
    return () => window.clearTimeout(timeout);
  }, []);

  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const edge of graph.edges) {
      if (!map.has(edge.a)) map.set(edge.a, new Set());
      if (!map.has(edge.b)) map.set(edge.b, new Set());
      map.get(edge.a)!.add(edge.b);
      map.get(edge.b)!.add(edge.a);
    }
    return map;
  }, [graph.edges]);
  const groupSizes = useMemo(() => {
    const map = new Map<string, number>();
    for (const member of members) {
      map.set(member.group_label, (map.get(member.group_label) ?? 0) + 1);
    }
    return map;
  }, [members]);

  const active = drag?.type === "node" ? drag.id : selected ?? hover;
  const selectedNode = selected ? nodeById.get(selected) : null;
  const selectedConnections = selectedNode ? neighbors.get(selectedNode.id)?.size ?? 0 : 0;
  const groupCount = new Set(members.map((member) => member.group_label)).size;
  const driverCount = members.filter((member) => member.is_driver).length;

  const toSvgPoint = (event: { clientX: number; clientY: number }) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return CENTER;
    return {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H,
    };
  };

  const toWorldPoint = (point: { x: number; y: number }, currentView = view) => ({
    x: (point.x - currentView.x) / currentView.scale,
    y: (point.y - currentView.y) / currentView.scale,
  });

  const isHighlighted = (id: string) => {
    if (!active) return true;
    if (id === active) return true;
    return neighbors.get(active)?.has(id) ?? false;
  };

  const isEdgeHighlighted = (edge: SimEdge) => {
    if (!active) return true;
    return edge.a === active || edge.b === active;
  };

  const resetGraph = () => {
    setNodes(cloneNodes(graph.nodes));
    setView({ x: 0, y: 0, scale: 1 });
    setSelected(null);
    setHover(null);
    setDrag(null);
  };

  const zoomAt = (scaleDelta: number, anchor = CENTER) => {
    setView((current) => {
      const nextScale = clamp(current.scale * scaleDelta, MIN_SCALE, MAX_SCALE);
      const world = toWorldPoint(anchor, current);
      return {
        scale: nextScale,
        x: anchor.x - world.x * nextScale,
        y: anchor.y - world.y * nextScale,
      };
    });
  };

  const scrollToSelectedMember = () => {
    if (!selectedNode?.anchorId) return;
    const target = document.getElementById(selectedNode.anchorId);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    if (target instanceof HTMLElement) {
      target.focus({ preventScroll: true });
    }
  };

  const handleWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const anchor = toSvgPoint(event);
    zoomAt(event.deltaY > 0 ? 0.9 : 1.1, anchor);
  };

  const handleCanvasPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = toSvgPoint(event);
    setSelected(null);
    setDrag({
      type: "pan",
      pointerId: event.pointerId,
      startX: point.x,
      startY: point.y,
      viewX: view.x,
      viewY: view.y,
    });
  };

  const handleNodePointerDown = (event: ReactPointerEvent<SVGGElement>, node: SimNode) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = toWorldPoint(toSvgPoint(event));
    setHover(node.id);
    if (node.kind === "person") setSelected(node.id);
    setDrag({
      type: "node",
      pointerId: event.pointerId,
      id: node.id,
      offsetX: node.x - point.x,
      offsetY: node.y - point.y,
      startPositions: Object.fromEntries(
        nodes.map((current) => [current.id, { x: current.x, y: current.y }]),
      ),
      influence: buildDragInfluence(node.id, nodes, graph.edges),
    });
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();

    if (drag.type === "pan") {
      const point = toSvgPoint(event);
      setView((current) => ({
        ...current,
        x: drag.viewX + point.x - drag.startX,
        y: drag.viewY + point.y - drag.startY,
      }));
      return;
    }

    const point = toWorldPoint(toSvgPoint(event));
    const start = drag.startPositions[drag.id];
    if (!start) return;

    const draggedNode = nodeById.get(drag.id);
    const pad = (draggedNode?.r ?? 24) + 24;
    const targetX = clamp(point.x + drag.offsetX, pad, W - pad);
    const targetY = clamp(point.y + drag.offsetY, pad, H - pad);
    const dx = targetX - start.x;
    const dy = targetY - start.y;

    setNodes((current) =>
      current.map((node) => {
        const influence = drag.influence[node.id] ?? 0;
        const startPosition = drag.startPositions[node.id];
        if (!startPosition || influence <= 0 || (node.fixed && node.id !== drag.id)) return node;

        const nodePad = node.r + 24;
        return {
          ...node,
          x: roundCoord(clamp(startPosition.x + dx * influence, nodePad, W - nodePad)),
          y: roundCoord(clamp(startPosition.y + dy * influence, nodePad, H - nodePad)),
          vx: 0,
          vy: 0,
        };
      }),
    );
  };

  const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (drag?.pointerId === event.pointerId) setDrag(null);
  };

  return (
    <div className="relative isolate w-full overflow-hidden rounded-lg border border-ink/10 bg-[#0D0E10] shadow-[0_24px_80px_rgba(10,10,10,0.18)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 28% 62%, rgba(216,222,232,0.16), transparent 28%), radial-gradient(circle at 70% 34%, rgba(240,68,56,0.15), transparent 24%), radial-gradient(circle at 72% 72%, rgba(215,168,74,0.13), transparent 24%), linear-gradient(145deg, #151719 0%, #090A0B 58%, #11100D 100%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "58px 58px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.35] to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-racing via-racing/30 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 0 46%, rgba(255,255,255,0.08) 46% 46.3%, transparent 46.3% 100%)",
        }}
        aria-hidden
      />

      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-2 sm:left-5 sm:top-5">
        <span className="border border-white/[0.12] bg-white/[0.07] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/75 backdrop-blur">
          {members.length} Mitglieder
        </span>
        <span className="hidden border border-white/[0.12] bg-white/[0.07] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/75 backdrop-blur sm:inline-flex">
          {groupCount} Gruppen
        </span>
        {driverCount > 0 && (
          <span className="hidden border border-racing/[0.35] bg-racing/[0.12] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur sm:inline-flex">
            {driverCount} Fahrer
          </span>
        )}
      </div>

      <div
        className="absolute right-3 top-3 z-20 flex overflow-hidden rounded-md border border-white/[0.12] bg-black/[0.35] text-white shadow-[0_14px_40px_rgba(0,0,0,0.28)] backdrop-blur sm:right-5 sm:top-5"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Verkleinern"
          title="Verkleinern"
          className="flex h-10 w-10 items-center justify-center border-r border-white/10 text-lg leading-none text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
          onClick={() => zoomAt(0.9)}
        >
          -
        </button>
        <button
          type="button"
          aria-label="Ansicht zuruecksetzen"
          title="Ansicht zuruecksetzen"
          className="flex h-10 w-10 items-center justify-center border-r border-white/10 text-base leading-none text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
          onClick={resetGraph}
        >
          &#8634;
        </button>
        <button
          type="button"
          aria-label="Vergroessern"
          title="Vergroessern"
          className="flex h-10 w-10 items-center justify-center text-lg leading-none text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
          onClick={() => zoomAt(1.1)}
        >
          +
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="relative block aspect-[1180/720] min-h-[500px] w-full select-none touch-none sm:min-h-0"
        role="img"
        aria-label="Interaktives Mitglieder-Netzwerk des Rallyeclub Klostertal"
        onWheel={handleWheel}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ cursor: drag?.type === "pan" ? "grabbing" : "grab" }}
      >
        <defs>
          <filter id="memberGraphShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="12" floodColor="#000000" floodOpacity="0.36" stdDeviation="12" />
          </filter>
          <filter id="memberGraphGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {Array.from(new Set(nodes.map((node) => node.group))).map((group) => {
            const style = getGroupStyle(group);
            return (
              <radialGradient key={group} id={`node-glow-${safeId(group)}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={style.color} stopOpacity="0.44" />
                <stop offset="100%" stopColor={style.color} stopOpacity="0" />
              </radialGradient>
            );
          })}
          {nodes
            .filter((node) => node.kind === "person")
            .map((node) => {
              const activeNode = active === node.id;
              const radius = node.r * (activeNode ? 1.16 : 1);
              return (
                <clipPath key={node.id} id={`avatar-${safeId(node.id)}`}>
                  <circle cx="0" cy="0" r={radius} />
                </clipPath>
              );
            })}
        </defs>

        <g
          transform={`translate(${formatCoord(view.x)} ${formatCoord(view.y)}) scale(${formatCoord(
            view.scale,
          )})`}
        >
          <g>
            {nodes
              .filter((node) => node.kind === "group")
              .map((node) => {
                const style = getGroupStyle(node.group);
                const highlighted = isHighlighted(node.id);
                const radius = clusterRadiusForGroup(node.group, groupSizes.get(node.group) ?? 0);

                return (
                  <circle
                    key={`zone-${node.id}`}
                    cx={formatCoord(node.x)}
                    cy={formatCoord(node.y)}
                    r={radius}
                    fill={style.color}
                    fillOpacity={highlighted ? 0.075 : 0.035}
                    stroke={style.color}
                    strokeOpacity={highlighted ? 0.17 : 0.07}
                    strokeWidth="1"
                  />
                );
              })}
          </g>

          <g>
            {graph.edges.map((edge, index) => {
              const a = nodeById.get(edge.a);
              const b = nodeById.get(edge.b);
              if (!a || !b) return null;

              const activeEdge = isEdgeHighlighted(edge);
              const linkedGroup = a.kind === "group" ? a.group : b.kind === "group" ? b.group : a.group;
              const color =
                edge.kind === "family"
                  ? "#D7A84A"
                  : edge.kind === "role"
                    ? "#F04438"
                    : getGroupStyle(linkedGroup).color;
              const opacity = mounted ? (activeEdge ? 0.5 : 0.09) : 0;
              const strokeWidth = edge.kind === "hub" ? 0.95 : 1.55;

              return (
                <path
                  key={`${edge.a}-${edge.b}-${edge.kind}-${index}`}
                  d={edgePath(edge, a, b)}
                  fill="none"
                  stroke={color}
                  strokeLinecap="round"
                  strokeWidth={activeEdge ? strokeWidth + 0.45 : strokeWidth}
                  strokeDasharray={edge.kind === "role" ? "5 7" : undefined}
                  style={{
                    opacity,
                    transition: "opacity 240ms ease, stroke-width 240ms ease",
                  }}
                />
              );
            })}
          </g>

          <g>
            {nodes.map((node) => {
              const style = getGroupStyle(node.group);
              const highlighted = isHighlighted(node.id);
              const activeNode = active === node.id;
              const draggingNode = drag?.type === "node" && drag.id === node.id;
              const radius = node.r * (activeNode ? 1.16 : 1);
              const opacity = mounted ? (highlighted ? 1 : 0.22) : 0;
              const labelWidth = Math.min(214, Math.max(92, node.label.length * 7.2));
              const canShowPersonLabel = node.kind === "person" && activeNode;

              return (
                <g
                  key={node.id}
                  data-node-id={node.id}
                  transform={`translate(${formatCoord(node.x)} ${formatCoord(node.y)})`}
                  onPointerDown={(event) => handleNodePointerDown(event, node)}
                  onMouseEnter={() => setHover(node.id)}
                  onMouseLeave={() => setHover((current) => (current === node.id ? null : current))}
                  style={{
                    opacity,
                    cursor: draggingNode ? "grabbing" : "grab",
                    transition: draggingNode ? "none" : "opacity 220ms ease",
                  }}
                >
                  <circle
                    r={radius + (node.kind === "person" ? 18 : 32)}
                    fill={`url(#node-glow-${safeId(node.group)})`}
                    opacity={activeNode || node.kind !== "person" ? 0.85 : 0.34}
                    filter={activeNode ? "url(#memberGraphGlow)" : undefined}
                  />

                  {node.is_driver && (
                    <circle
                      r={radius + 7}
                      fill="none"
                      stroke="#E10600"
                      strokeDasharray="3 4"
                      strokeWidth="1.6"
                      opacity="0.95"
                    />
                  )}

                  <circle
                    r={radius + 4}
                    fill="#070707"
                    stroke={activeNode ? "#FFFFFF" : style.color}
                    strokeWidth={activeNode ? 2.1 : 1.45}
                    filter="url(#memberGraphShadow)"
                  />

                  {node.kind === "person" && node.photo ? (
                    <>
                      <image
                        href={node.photo}
                        x={-radius}
                        y={-radius}
                        width={radius * 2}
                        height={radius * 2}
                        clipPath={`url(#avatar-${safeId(node.id)})`}
                        preserveAspectRatio="xMidYMid slice"
                      />
                      <circle
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.38)"
                        strokeWidth="1"
                      />
                    </>
                  ) : (
                    <>
                      <circle
                        r={radius}
                        fill={node.kind === "center" ? "#E10600" : style.muted}
                        stroke={style.color}
                        strokeWidth={node.kind === "center" ? 2 : 1.4}
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#FFFFFF"
                        fontFamily="var(--font-bebas), Impact, sans-serif"
                        fontSize={node.kind === "center" ? 24 : 14}
                        letterSpacing={node.kind === "center" ? 2 : 1.6}
                      >
                        {node.kind === "person"
                          ? node.label
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          : node.kind === "center"
                            ? "RCK"
                            : groupShortLabel(node.group)}
                      </text>
                    </>
                  )}

                  {node.kind === "group" && (
                    <g>
                      <rect
                        x={-labelWidth / 2}
                        y={radius + 10}
                        width={labelWidth}
                        height="29"
                        rx="6"
                        fill="rgba(0,0,0,0.72)"
                        stroke={style.color}
                        strokeOpacity="0.62"
                      />
                      <text
                        x="0"
                        y={radius + 29}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="10"
                        fontWeight="800"
                        letterSpacing="1.4"
                      >
                        {node.label.toUpperCase()}
                      </text>
                    </g>
                  )}

                  {canShowPersonLabel && (
                    <g>
                      <rect
                        x={-labelWidth / 2}
                        y={radius + 10}
                        width={labelWidth}
                        height={node.sublabel ? 45 : 32}
                        rx="7"
                        fill="rgba(0,0,0,0.86)"
                        stroke={style.color}
                        strokeOpacity="0.8"
                      />
                      <text
                        x="0"
                        y={radius + 29}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="800"
                      >
                        {node.label}
                      </text>
                      {node.sublabel && (
                        <text
                          x="0"
                          y={radius + 42}
                          textAnchor="middle"
                          fill={style.color}
                          fontSize="8.5"
                          fontWeight="800"
                          letterSpacing="1.2"
                        >
                          {node.sublabel.toUpperCase()}
                        </text>
                      )}
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/[0.68] sm:bottom-5 sm:left-5 sm:right-5">
        {["Vorstand", "Ehrenmitglieder", "Mitglieder"].map((group) => (
          <span key={group} className="inline-flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5"
              style={{ background: getGroupStyle(group).color }}
            />
            {group}
          </span>
        ))}
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-[2px] w-6 bg-[#D6A341]" />
          Familie
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-[2px] w-6"
            style={{
              background:
                "repeating-linear-gradient(90deg, #E10600 0 5px, transparent 5px 10px)",
            }}
          />
          Rolle
        </span>
      </div>

      {selectedNode?.kind === "person" && (
        <div
          className="absolute bottom-14 left-3 right-3 z-20 rounded-lg border border-white/[0.14] bg-[#111316]/[0.88] p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.42)] backdrop-blur-md sm:bottom-auto sm:left-auto sm:right-5 sm:top-16 sm:w-[308px]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            {selectedNode.photo ? (
              <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/20">
                <Image
                  src={selectedNode.photo}
                  alt={selectedNode.label}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </span>
            ) : (
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ring-1 ring-white/20"
                style={{ background: getGroupStyle(selectedNode.group).muted }}
              >
                {selectedNode.label
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <div className="truncate font-display text-2xl leading-none tracking-wider">
                {selectedNode.label}
              </div>
              {selectedNode.sublabel && (
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-racing">
                  {selectedNode.sublabel}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/[0.65]">
            <div className="rounded-md border border-white/10 bg-white/[0.055] px-3 py-2">
              {selectedNode.group}
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.055] px-3 py-2">
              {selectedConnections} Links
            </div>
          </div>
          {selectedNode.is_driver && (
            <div className="mt-2 rounded-md border border-racing/[0.45] bg-racing/[0.15] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
              Aktiver Fahrer
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedNode.anchorId && (
              <button
                type="button"
                onClick={scrollToSelectedMember}
                className="rounded-md border border-racing bg-racing px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-racing-600 focus:outline-none focus:ring-2 focus:ring-racing"
              >
                Info ansehen
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-md border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/[0.55] transition hover:border-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-racing"
            >
              Schliessen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
