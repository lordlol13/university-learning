import type { Metadata } from "next";
import MascotPlayground from "@/scenes/MascotPlayground";
export const metadata: Metadata = {
  title: "Character studio",
  robots: { index: false, follow: false },
};
export default function MascotPlaygroundPage() {
  return <MascotPlayground />;
}
