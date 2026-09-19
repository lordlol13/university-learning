"use client";
import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { worldConfig } from "@/data/world-config";

export function CameraController({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const { camera, size } = useThree();
  const target = useMemo(() => new Vector3(), []);
  const destination = useMemo(() => new Vector3(), []);
  useFrame((state, delta) => {
    const narrow = size.width / size.height < 0.75;
    const config = worldConfig.camera;
    const zoom = narrow ? config.narrowZoom : 1;
    target.set(
      narrow ? config.narrowTargetX : config.targetX,
      config.targetY,
      config.targetZ,
    );
    destination.set(
      (narrow ? config.narrowX : config.x) * zoom +
        (reducedMotion || narrow ? 0 : state.pointer.x * 0.16),
      config.y * zoom,
      config.z * zoom,
    );
    if (reducedMotion) camera.position.copy(destination);
    else
      camera.position.lerp(
        destination,
        1 - Math.exp(-Math.min(delta, 0.1) * config.easing),
      );
    camera.lookAt(target);
  });
  return null;
}
