import { Bone, Matrix4, Skeleton, type Group } from "three";
import { storkDesign } from "./stork-config";
export const storkJointNames = [
  "root",
  "body",
  "chest",
  "neck_01",
  "neck_02",
  "head",
  "beak_upper",
  "beak_lower",
  "eye_left",
  "eye_right",
  "eyelid_left",
  "eyelid_right",
  "brow_left",
  "brow_right",
  "wing_L_shoulder",
  "wing_L_mid",
  "wing_L_tip",
  "wing_R_shoulder",
  "wing_R_mid",
  "wing_R_tip",
  "leg_L_upper",
  "leg_L_lower",
  "foot_L",
  "leg_R_upper",
  "leg_R_lower",
  "foot_R",
  "tail",
  "cap",
  "tassel_01",
  "tassel_02",
] as const;
export type StorkJoint = (typeof storkJointNames)[number];
export type StorkRig = Partial<Record<StorkJoint, Group>>;
export function createStorkRig() {
  const joints: StorkRig = {};
  const bind = Object.fromEntries(
    storkJointNames.map((name) => [
      name,
      (group: Group | null) => {
        if (group) joints[name] = group;
        else delete joints[name];
      },
    ]),
  ) as Record<StorkJoint, (group: Group | null) => void>;
  return {
    joints: { current: joints },
    bind: (name: StorkJoint) => bind[name],
  };
}
export type BoundStorkRig = ReturnType<typeof createStorkRig>;

/** Independent render bones; logical attachment joints continue to own animation. */
export function createStorkSkin() {
  const root = new Bone(), head = new Bone();
  head.position.fromArray(storkDesign.headOffset);
  root.add(head);
  root.updateMatrixWorld(true);
  return {
    root, head,
    skeleton: new Skeleton([root, head]),
    relative: new Matrix4(),
    identity: new Matrix4(),
  };
}
