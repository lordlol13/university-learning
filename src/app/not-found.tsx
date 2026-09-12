import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="standard-page">
      <section className="panel-card empty-state">
        <span className="empty-icon">
          <Compass size={40} />
        </span>
        <span className="eyebrow">A SMALL DETOUR</span>
        <h1>This path hasn’t been mapped.</h1>
        <p>
          We couldn’t find that page. Your learning journey is still right here.
        </p>
        <Link className="button primary" href="/courses">
          <ArrowLeft size={17} />
          Find your course
        </Link>
      </section>
    </div>
  );
}
