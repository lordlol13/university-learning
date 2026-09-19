import {
  CylinderGeometry,
  LatheGeometry,
  MeshStandardMaterial,
  SphereGeometry,
  TubeGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { qualitySettings } from "./stork-config";
import { createCharacterShapes } from "./StorkGeometry";

export const storkPalette = {
  white: "#F7F7F2",
  black: "#252A2C",
  eye: "#241911",
  orange: "#FF7A16",
  beakLower: "#CE4F16",
  green: "#2F7D32",
  gold: "#F5B82E",
} as const;
/** Eight untextured materials and shared immutable geometry across every character. */
export const storkMaterials = {
  white: new MeshStandardMaterial({
    color: storkPalette.white,
    roughness: 0.74,
  }),
  wing: new MeshStandardMaterial({ color: "#E9EAE1", roughness: 0.81 }),
  black: new MeshStandardMaterial({
    color: storkPalette.black,
    roughness: 0.76,
  }),
  eye: new MeshStandardMaterial({ color: storkPalette.eye, roughness: 0.19 }),
  orange: new MeshStandardMaterial({
    color: storkPalette.orange,
    roughness: 0.47,
  }),
  beakLower: new MeshStandardMaterial({
    color: storkPalette.beakLower,
    roughness: 0.6,
  }),
  green: new MeshStandardMaterial({
    color: storkPalette.green,
    roughness: 0.64,
  }),
  gold: new MeshStandardMaterial({ color: storkPalette.gold, roughness: 0.53 }),
};
export const storkGeometry = Object.fromEntries(
  Object.entries(qualitySettings).map(([key, q]) => [
    key,
    {
      ...createCharacterShapes(q.segments),
      sphere: new SphereGeometry(1, q.segments, q.rings),
      detail: new SphereGeometry(1, 12, 8),
      cylinder: new CylinderGeometry(0.85, 1, 1, 10),
      box: new RoundedBoxGeometry(1, 1, 1, 2, 0.11),
      lid: new SphereGeometry(
        1,
        q.segments,
        q.rings / 2,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2,
      ),
    },
  ]),
) as Record<
  keyof typeof qualitySettings,
  {
    sphere: SphereGeometry;
    detail: SphereGeometry;
    cylinder: CylinderGeometry;
    box: RoundedBoxGeometry;
    lid: SphereGeometry;
    beak: LatheGeometry;
    head: LatheGeometry;
    body: LatheGeometry;
    wing: LatheGeometry;
    shin: LatheGeometry;
    strap: TubeGeometry;
  }
>;
