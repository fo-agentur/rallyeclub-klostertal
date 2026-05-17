import { NextResponse } from "next/server"

// Lightweight liveness probe for Docker/Coolify/Traefik health checks.
// Intentionally does NOT touch the DB or S3 so a flaky dependency
// cannot mark the web container as unhealthy and stop traffic.
export const dynamic = "force-dynamic"
export const revalidate = 0

export function GET() {
  return NextResponse.json(
    { status: "ok", uptime: process.uptime() },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  )
}

export function HEAD() {
  return new Response(null, { status: 200, headers: { "Cache-Control": "no-store" } })
}
