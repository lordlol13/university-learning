"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical root layout failure:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center p-6 bg-slate-50 font-sans">
        <section className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center border border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">Application Error</h1>
          <p className="mt-2 text-sm text-slate-600">
            A critical error occurred while loading the campus workspace.
          </p>
          {error.digest && (
            <code className="mt-2 block text-xs font-mono text-slate-400">
              Digest: {error.digest}
            </code>
          )}
          <button
            type="button"
            className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition cursor-pointer"
            onClick={() => reset()}
          >
            Reload application
          </button>
        </section>
      </body>
    </html>
  );
}
