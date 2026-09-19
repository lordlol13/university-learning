# Stork proportion review — 2026-09-13

This pass changes the procedural mascot anatomy only. It preserves the public component API, controllers, materials, quality tiers, and application placement. Screenshots capture the running WebGL model.

## Anatomy

- Chest-to-head attachment span: 0.60 → 1.18 anatomical units. The outer neck is a continuous slender S-shaped loft, widening smoothly into the chest and skull.
- Torso: lower-middle fullness, narrower shoulders, and a longer vertical contour. Maximum radius decreases from 0.455 to 0.37.
- Head: width reduced from 0.92 to 0.80 while retaining 0.87 height and large expressive eyes.
- Beak: tapered length increases from 0.92 to 1.07; maximum radius decreases from 0.18 to 0.145, with a thinner vertical section and separately articulated lower jaw. The neutral pose retains a small expressive opening.
- Hip height increases from 0.81 to 1.02; leg thickness and the three rounded toes are reduced. One foot remains forward and wing asymmetry is retained.
- The construction is uniformly normalized from 3.36 to the existing 2.52-unit display envelope. Numerical comparisons describe construction coordinates, not a change to the application's external mascot scale.

## Rendered checks

- [Front](front.png): large eyes, elongated throat, narrow torso, separate feet.
- [Three-quarter](three-quarter.png): tapered beak, cap, wing asymmetry, organic head/neck transition.
- [Side](side.png): visibly curved neck, long pointed beak, vertical body, thin grounded legs.
- [Black side silhouette](silhouette-side.png) and [black three-quarter silhouette](silhouette-three-quarter.png): defining anatomy remains readable without materials or facial detail. Captured using a temporary unlit debug material; the audit override was removed before the build.
- [Thinking](thinking.png), [wave](wave.png), [celebrate](celebrate.png), and [point](point.png): existing poses render with the revised proportions. Each transient gesture was observed returning to idle.
- [Production desktop, 1440px](final-desktop.png) and [production mobile, 390px](final-mobile.png): the whole character remains visible within its stage, with accessible HTML controls.

## Verification

`npm run build`, `npm run typecheck`, `npm run lint`, and all 19 tests passed. Coverage includes finite custom geometry/normals, the deformed body's normal seam, gaze limits, reduced-motion jumps, blinking, controller interruption/idle restoration, and existing application regression tests.

Fresh production navigation at port 3002 produced no captured console errors or warnings. The optional `public/models/stork.glb` is absent; visual checks exercise the procedural fallback. No new GLB behavior was introduced by this anatomy pass.

Development statistics at 1440px / automatic high quality: 20,892 character triangles, eight materials, 61 scene draw calls, and approximately 144 fps on this machine. This is a local observation, not a guarantee for other hardware. The longer neck adds 480 triangles versus the preceding shape; it adds no draw calls, textures, dependencies, or frame loops. Existing DPR limits, reduced-motion behavior, and visibility-based render suspension remain in place.
