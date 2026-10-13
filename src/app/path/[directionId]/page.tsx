import { notFound } from "next/navigation";
import { directions, getDirection } from "@/data/curriculum";
import { DirectionView } from "@/components/learning-world/DirectionView";

export const dynamicParams = false;

const ROUTE_ALIASES: Record<string, string> = {
  "italian-culture": "italian-language",
};

function resolveDirectionId(id: string): string {
  return ROUTE_ALIASES[id] ?? id;
}

export function generateStaticParams() {
  const params = directions.map((direction) => ({ directionId: direction.id }));
  for (const alias of Object.keys(ROUTE_ALIASES)) {
    params.push({ directionId: alias });
  }
  return params;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ directionId: string }>;
}) {
  const { directionId } = await params;
  const targetId = resolveDirectionId(directionId);
  return { title: getDirection(targetId)?.title ?? "Path not found" };
}
export default async function DirectionPage({
  params,
}: {
  params: Promise<{ directionId: string }>;
}) {
  const { directionId } = await params;
  const targetId = resolveDirectionId(directionId);
  const direction = getDirection(targetId);
  if (!direction) notFound();
  return <DirectionView direction={direction} />;
}
