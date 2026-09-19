import { Group, SkinnedMesh, Vector3 } from "three";
import { createStorkSkin } from "../src/components/mascot/StorkRig";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createCharacterShapes } from "../src/components/mascot/StorkGeometry";
import { StorkController } from "../src/lib/stork-controller";
import {
  clampLook,
  jumpEnvelope,
  IdleVariation,
} from "../src/components/mascot/StorkAnimations";
import { storkDesign } from "../src/components/mascot/stork-config";

test("custom character surfaces stay finite and the deformed torso has a smooth seam", () => {
  for (const segments of [12, 18, 24]) {
    const shapes = createCharacterShapes(segments);
    for (const geometry of Object.values(shapes)) {
      assert.ok(
        [...geometry.getAttribute("position").array].every(Number.isFinite),
      );
      assert.ok(
        [...geometry.getAttribute("normal").array].every(Number.isFinite),
      );
    }
    const normals = shapes.body.getAttribute("normal"),
      rows = shapes.body.parameters.points.length;
    for (let i = 0; i < rows; i++) {
      assert.equal(normals.getX(i), normals.getX(segments * rows + i));
      assert.equal(normals.getZ(i), normals.getZ(segments * rows + i));
    }
    Object.values(shapes).forEach((g) => g.dispose());
  }
});
test("explicit gesture replaces previous command and returns to idle", () => {
  const c = new StorkController();
  c.play("thinking", 3);
  c.play("wave", 2);
  for (let i = 0; i < 21; i++) c.update(0.1);
  assert.equal(c.animation, "idle");
});
test("look constraints remain anatomical and reduced-motion jumps stay grounded", () => {
  const look = clampLook(100, -100);
  assert.equal(look.yaw, storkDesign.headYaw);
  assert.equal(look.pitch, -storkDesign.headPitch);
  for (let t = 0; t < 3; t += 0.01) {
    assert.deepEqual(jumpEnvelope(t, true), { lift: 0, crouch: 0 });
    assert.ok(jumpEnvelope(t, false).lift >= 0);
  }
  assert.equal(jumpEnvelope(2, false).lift, 0);
});
test("automatic eyelids reopen and disabling blink holds the eyes open", () => {
  const idle = new IdleVariation(() => 0);
  assert.equal(idle.update(2.5, true), 0);
  assert.ok(idle.update(2.59, true) > 0.99);
  assert.equal(idle.update(2.8, true), 0);
  assert.equal(idle.update(5.09, false), 0);
});

test("continuous skin preserves rest shape under placement and moves only weighted head vertices", () => {
  const shapes = createCharacterShapes(18);
  const skin = createStorkSkin();
  const mesh = new SkinnedMesh(shapes.body);
  mesh.add(skin.root);
  mesh.bind(skin.skeleton, skin.identity);
  const placement = new Group();
  placement.position.set(3, 2, -4);
  placement.rotation.set(0.1, 0.7, 0);
  placement.scale.setScalar(0.8);
  placement.add(mesh);
  placement.updateMatrixWorld(true);
  const vertices = shapes.body.getAttribute("position");
  const weights = shapes.body.getAttribute("skinWeight");
  let crown = -1, belly = -1;
  for (let i = 0; i < vertices.count; i++) {
    assert.ok(Math.abs(weights.getX(i) + weights.getY(i) - 1) < 1e-6);
    const base = new Vector3().fromBufferAttribute(vertices, i);
    assert.ok(mesh.applyBoneTransform(i, base.clone()).distanceTo(base) < 1e-6);
    if (weights.getY(i) === 1 && Math.abs(base.x) > 0.1) crown = i;
    if (weights.getY(i) === 0) belly = i;
  }
  assert.ok(crown >= 0 && belly >= 0);
  skin.head.rotation.y = Math.PI / 4;
  placement.updateMatrixWorld(true);
  const headBefore = new Vector3().fromBufferAttribute(vertices, crown);
  const headAfter = mesh.applyBoneTransform(crown, headBefore.clone());
  assert.ok(headAfter.distanceTo(headBefore) > 0.05);
  assert.ok(Math.abs(headAfter.distanceTo(skin.head.position) - headBefore.distanceTo(skin.head.position)) < 1e-6);
  const bellyBefore = new Vector3().fromBufferAttribute(vertices, belly);
  assert.ok(mesh.applyBoneTransform(belly, bellyBefore.clone()).distanceTo(bellyBefore) < 1e-6);
  skin.skeleton.dispose();
  Object.values(shapes).forEach((geometry) => geometry.dispose());
});
