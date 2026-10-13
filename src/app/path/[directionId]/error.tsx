"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PathError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Learning path error:", error);
  }, [error]);

  return (
    <div className="standard-page">
      <section className="panel-card empty-state">
        <h1 className="text-xl font-bold mb-2">Campus Path Error</h1>
        <p className="text-sm opacity-80 mb-4">
          Unable to render the 3D learning campus for this track. You can retry or return to the track catalog.
        </p>
        {error?.digest && (
          <code className="text-xs text-muted-foreground block mb-4">
            Digest: {error.digest}
          </code>
        )}
        <div className="flex gap-3 justify-center">
          <button className="button primary" onClick={reset}>
            Retry View
          </button>
          <Link href="/courses" className="button secondary">
            Browse All Tracks
          </Link>
        </div>
      </section>
    </div>
  );
}
