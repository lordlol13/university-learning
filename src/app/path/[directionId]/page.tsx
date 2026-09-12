import { notFound } from "next/navigation";
import { directions, getDirection } from "@/data/curriculum";
import { DirectionView } from "@/components/learning-world/DirectionView";

export const dynamicParams = false;

export function generateStaticParams() {
  return directions.map((direction) => ({ directionId: direction.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ directionId: string }>;
}) {
  const { directionId } = await params;
  return { title: getDirection(directionId)?.title ?? "Path not found" };
}
export default async function DirectionPage({
  params,
}: {
  params: Promise<{ directionId: string }>;
}) {
  const { directionId } = await params;
  const direction = getDirection(directionId);
  if (!direction) notFound();
  return <DirectionView direction={direction} />;
}
