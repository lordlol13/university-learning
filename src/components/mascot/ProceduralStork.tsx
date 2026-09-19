"use client";
import { storkDesign } from "./stork-config";
import { useState } from "react";
import { createStorkRig } from "./StorkRig";
import { StorkModel } from "./StorkModel";
import { StorkAnimator } from "./StorkAnimator";
import type { StorkPoseProps } from "./types";
export type { StorkPoseProps } from "./types";

export function ProceduralStork(props: StorkPoseProps) {
  const [rig] = useState(createStorkRig);
  return (
    <group name="procedural-stork" scale={storkDesign.height / storkDesign.modelHeight}>
      <StorkModel rig={rig} quality={props.quality} backpack={props.backpack} />
      <StorkAnimator rig={rig} {...props} />
    </group>
  );
}
