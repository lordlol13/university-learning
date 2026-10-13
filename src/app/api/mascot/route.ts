import { existsSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

let cachedAvailability: boolean | null = null;

function isModelAvailable(): boolean {
  if (cachedAvailability === null) {
    try {
      const targetPath = path.join(
        process.cwd(),
        "public",
        "models",
        "stork.glb",
      );
      cachedAvailability = existsSync(targetPath);
    } catch {
      cachedAvailability = false;
    }
  }
  return cachedAvailability;
}

export async function GET() {
  const available = isModelAvailable();
  return NextResponse.json(
    { modelUrl: available ? "/models/stork.glb" : null },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
