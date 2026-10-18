"use client";

import React, { useLayoutEffect, useRef, useState, useMemo } from "react";
import ReactDOM from "react-dom/client";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";

export interface SafeHtmlProps {
  children?: React.ReactNode;
  position?: [number, number, number];
  center?: boolean;
  distanceFactor?: number;
  zIndexRange?: [number, number];
  style?: React.CSSProperties;
  className?: string;
  as?: string;
}

const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const v3 = new THREE.Vector3();

function isObjectBehindCamera(el: THREE.Object3D, camera: THREE.Camera): boolean {
  const objectPos = v1.setFromMatrixPosition(el.matrixWorld);
  const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld);
  const deltaCamObj = objectPos.sub(cameraPos);
  const camDir = camera.getWorldDirection(v3);
  return deltaCamObj.angleTo(camDir) > Math.PI / 2;
}

function objectScale(el: THREE.Object3D, camera: THREE.Camera): number {
  if (camera instanceof THREE.OrthographicCamera) {
    return camera.zoom;
  }
  if (camera instanceof THREE.PerspectiveCamera) {
    const objectPos = v1.setFromMatrixPosition(el.matrixWorld);
    const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld);
    const vFOV = (camera.fov * Math.PI) / 180;
    const dist = objectPos.distanceTo(cameraPos);
    const scaleFOV = 2 * Math.tan(vFOV / 2) * dist;
    return 1 / (scaleFOV || 1);
  }
  return 1;
}

function objectZIndex(
  el: THREE.Object3D,
  camera: THREE.Camera,
  zIndexRange: [number, number]
): number | undefined {
  if (
    camera instanceof THREE.PerspectiveCamera ||
    camera instanceof THREE.OrthographicCamera
  ) {
    const objectPos = v1.setFromMatrixPosition(el.matrixWorld);
    const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld);
    const dist = objectPos.distanceTo(cameraPos);
    const A = (zIndexRange[1] - zIndexRange[0]) / (camera.far - camera.near);
    const B = zIndexRange[1] - A * camera.far;
    return Math.round(A * dist + B);
  }
  return undefined;
}

/**
 * SafeHtml: React 19-safe 3D HTML projection component.
 * Avoids React 19 "Attempted to synchronously unmount a root while React was already rendering"
 * and "Failed to execute 'removeChild' on 'Node'" by deferring root unmount and DOM removal
 * outside of React's synchronous render/layout commit phase.
 */
export const SafeHtml = React.forwardRef<HTMLDivElement, SafeHtmlProps>(
  function SafeHtml(
    {
      children,
      position,
      center = false,
      distanceFactor,
      zIndexRange = [16777271, 0],
      style,
      className,
      as = "div",
    },
    forwardedRef
  ) {
    const { gl, camera, size } = useThree();
    const [el] = useState(() => document.createElement(as));
    const groupRef = useRef<THREE.Group>(null);
    const rootRef = useRef<ReactDOM.Root | null>(null);
    const oldPosition = useRef<[number, number]>([0, 0]);
    const oldZoom = useRef(0);

    const updateProjection = React.useCallback(() => {
      if (!groupRef.current) return;

      camera.updateMatrixWorld();
      groupRef.current.updateWorldMatrix(true, false);

      const isBehind = isObjectBehindCamera(groupRef.current, camera);
      if (isBehind) {
        if (el.style.display !== "none") el.style.display = "none";
        return;
      }
      if (el.style.display === "none") {
        el.style.display = "block";
      }

      const objectPos = v1.setFromMatrixPosition(groupRef.current.matrixWorld);
      objectPos.project(camera);
      const widthHalf = size.width / 2;
      const heightHalf = size.height / 2;
      const screenX = objectPos.x * widthHalf + widthHalf;
      const screenY = -(objectPos.y * heightHalf) + heightHalf;

      const scale =
        distanceFactor === undefined
          ? 1
          : objectScale(groupRef.current, camera) * distanceFactor;

      el.style.transform = `translate3d(${screenX}px,${screenY}px,0) scale(${scale})`;

      const z = objectZIndex(groupRef.current, camera, zIndexRange);
      if (z !== undefined) {
        el.style.zIndex = `${z}`;
      }

      oldPosition.current = [screenX, screenY];
      oldZoom.current = camera.zoom;
    }, [camera, distanceFactor, el, size.height, size.width, zIndexRange]);

    // Initial DOM element setup
    useLayoutEffect(() => {
      el.style.position = "absolute";
      el.style.top = "0";
      el.style.left = "0";
      el.style.pointerEvents = "auto";
      el.style.transformOrigin = "0 0";

      const target = (gl.domElement.parentElement ||
        gl.domElement.parentNode) as HTMLElement | null;

      if (target && !target.contains(el)) {
        target.appendChild(el);
      }

      const root = ReactDOM.createRoot(el);
      rootRef.current = root;
      updateProjection();

      return () => {
        el.style.display = "none";
        // React 19 safe asynchronous cleanup
        setTimeout(() => {
          try {
            if (target && target.contains(el)) {
              target.removeChild(el);
            }
            root.unmount();
          } catch {
            // Ignore if already unmounted or detached
          }
        }, 0);
      };
    }, [el, gl.domElement, as, updateProjection]);

    // Update rendered React children into the root
    useLayoutEffect(() => {
      const root = rootRef.current;
      if (!root) return;

      root.render(
        <div
          ref={forwardedRef}
          className={className}
          style={{
            position: "absolute",
            transform: center ? "translate3d(-50%,-50%,0)" : "none",
            pointerEvents: "auto",
            ...style,
          }}
        >
          {children}
        </div>
      );
      updateProjection();
    });

    // Track 3D position and project to 2D screen coordinates on every frame
    useFrame(() => {
      updateProjection();
    });

    return <group ref={groupRef} position={position} />;
  }
);
