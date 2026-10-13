"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function LessonError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Lesson rendering error:", error);
  }, [error]);

  return (
    <div className="standard-page">
      <section className="panel-card empty-state">
        <h1 className="text-xl font-bold mb-2">Lesson Loading Error</h1>
        <p className="text-sm opacity-80 mb-4">
          There was a problem rendering this lesson. You can retry or return to your courses.
        </p>
        {error?.digest && (
          <code className="text-xs text-muted-foreground block mb-4">
            Digest: {error.digest}
          </code>
        )}
        <div className="flex gap-3 justify-center">
          <button className="button primary" onClick={reset}>
            Retry Lesson
          </button>
          <Link href="/courses" className="button secondary">
            Back to Courses
          </Link>
        </div>
      </section>
    </div>
  );
}
