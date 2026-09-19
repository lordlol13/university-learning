# Optional stork model

Place the finished model at `public/models/stork.glb` and reload the page. No model file is required for development: both canvases use the shared procedural stork until a valid GLB is available.

Use a self-contained GLB with embedded resources, Y up, and +Z facing forward. The loader centers the model horizontally, places its feet at the origin, and normalizes its bounding-box height to 2.3 scene units. Keep textures and geometry modest for two small browser views.

Supported animation clip names (case-insensitive):

- `idle` — loop
- `walk` — loop, in-place, without root translation
- `point`, `wave`, `celebrate`, `thinking` — one-shot reactions

The application owns position and heading along the road. Clips should animate the character locally. `useGLTF` caches the loaded resource while skeleton clones and `useAnimations` provide independent playback in the world and assistant. The model availability check is cached for the page lifetime, so reload after adding or replacing an asset.

No GLB is bundled. The procedural mascot is the currently verified visual; a supplied production asset should be checked for orientation, rig compatibility, clipping, and clip timing in both canvases.
