"use client";
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Box3, LoopOnce, LoopRepeat, Vector3 } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { ProceduralStork, type StorkPoseProps } from "./ProceduralStork";
import { useStorkAsset } from "./use-stork-asset";
import { resolveStorkClip, storkTiming } from "@/data/world-config";

function GltfStork({
  url,
  controller,
  reducedMotion,
}: StorkPoseProps & { url: string }) {
  const { scene, animations } = useGLTF(url);
  const model = useMemo(() => {
    const copy = clone(scene);
    const bounds = new Box3().setFromObject(copy),
      size = bounds.getSize(new Vector3()),
      center = bounds.getCenter(new Vector3());
    copy.position.set(-center.x, -bounds.min.y, -center.z);
    copy.traverse((object) => {
      object.castShadow = true;
      object.receiveShadow = true;
    });
    return { copy, scale: 2.3 / Math.max(size.y, 0.001) };
  }, [scene]);
  const { actions } = useAnimations(animations, model.copy);
  const actionsRef = useRef(actions);
  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);
  const lastAnimation = useRef("");
  useFrame(() => {
    const semantic = reducedMotion ? "idle" : controller.animation;
    const animationKey = `${semantic}:${reducedMotion}`;
    if (lastAnimation.current === animationKey) return;
    const animationActions = actionsRef.current;
    const name = resolveStorkClip(Object.keys(animationActions), semantic);
    const next = name ? animationActions[name] : undefined;
    Object.values(animationActions).forEach((action) => {
      if (action && action !== next) action.fadeOut(storkTiming.crossfade);
    });
    if (next) {
      next
        .reset()
        .fadeIn(storkTiming.crossfade)
        .setLoop(
          name?.toLowerCase() === "idle" || semantic === "walk"
            ? LoopRepeat
            : LoopOnce,
          name?.toLowerCase() === "idle" || semantic === "walk" ? Infinity : 1,
        )
        .play();
      // AnimationAction is an imperative Three.js resource, not immutable React state.
      // eslint-disable-next-line react-hooks/immutability
      next.clampWhenFinished = true;
      if (reducedMotion) {
        next.time = 0;
        next.paused = true;
      } else next.paused = false;
    }
    lastAnimation.current = animationKey;
  });
  return (
    <group scale={model.scale} dispose={null}>
      <primitive object={model.copy} />
    </group>
  );
}
class ModelBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
/** One original model contract, shared by the world and assistant. */
export function StorkAssetModel(props: StorkPoseProps) {
  const url = useStorkAsset();
  const fallback = <ProceduralStork {...props} />;
  return url ? (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <GltfStork url={url} {...props} />
      </Suspense>
    </ModelBoundary>
  ) : (
    fallback
  );
}
