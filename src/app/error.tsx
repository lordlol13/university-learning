"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="standard-page">
      <section className="panel-card empty-state">
        <h1>A small bump in the road.</h1>
        <p>This page couldn’t load. Give it another try.</p>
        <button className="button primary" onClick={reset}>
          Try again
        </button>
      </section>
    </div>
  );
}
