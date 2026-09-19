import { access } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function GET() {
  const available = await access(
    path.join(process.cwd(), "public", "models", "stork.glb"),
  ).then(
    () => true,
    () => false,
  );
  return NextResponse.json(
    { modelUrl: available ? "/models/stork.glb" : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
