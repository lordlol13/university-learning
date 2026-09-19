import type { Metadata } from "next";
import { ProgressProvider } from "@/stores/progress-provider";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";
import "./world.css";
import "katex/dist/katex.min.css";
import "./lesson.css";

export const metadata: Metadata = {
  title: { default: "Uplift — Your learning campus", template: "%s | Uplift" },
  description:
    "Build your university foundations, one lesson at a time. Explore your curriculum, grow your skills, and celebrate your progress.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ProgressProvider>
          <AppShell>{children}</AppShell>
        </ProgressProvider>
      </body>
    </html>
  );
}
