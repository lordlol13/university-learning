"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error encountered:", error);
  }, [error]);

  return (
    <div className="standard-page">
      <section className="panel-card empty-state">
        <h1>A small bump in the road.</h1>
        <p>This page couldn’t load. Give it another try.</p>
        {error?.digest && (
          <code className="text-xs text-muted-foreground block my-2">
            Digest: {error.digest}
          </code>
        )}
        <button className="button primary" onClick={reset}>
          Try again
        </button>
      </section>
    </div>
  );
}
