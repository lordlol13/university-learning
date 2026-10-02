import type { Metadata } from "next";
import Script from "next/script";
import { Nunito } from "next/font/google";
import { ProgressProvider } from "@/stores/progress-provider";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";
import "./world.css";
import "katex/dist/katex.min.css";
import "./lesson.css";

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: { default: "Uplift — Your learning campus", template: "%s | Uplift" },
  description:
    "Build your university foundations, one lesson at a time. Explore your curriculum, grow your skills, and celebrate your progress.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${nunito.className} ${nunito.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script
          id="sw-cache-cleaner"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(regs) {
                  for (var r of regs) r.unregister();
                });
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (var n of names) caches.delete(n);
                  });
                }
              }
            `,
          }}
        />
        <ProgressProvider>
          <AppShell>{children}</AppShell>
        </ProgressProvider>
      </body>
    </html>
  );
}
