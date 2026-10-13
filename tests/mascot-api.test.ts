import { test } from "node:test";
import assert from "node:assert/strict";
import { GET } from "../src/app/api/mascot/route";

test("GET /api/mascot returns 200, valid JSON payload, and proper caching headers", async () => {
  const response = await GET();
  assert.equal(response.status, 200);

  const cacheControl = response.headers.get("Cache-Control");
  assert.ok(cacheControl, "Cache-Control header should be present");
  assert.ok(cacheControl.includes("max-age="), "Cache-Control should have max-age");

  const nosniff = response.headers.get("X-Content-Type-Options");
  assert.equal(nosniff, "nosniff");

  const json = await response.json();
  assert.ok("modelUrl" in json, "Response body should contain modelUrl property");
  assert.ok(
    json.modelUrl === null || typeof json.modelUrl === "string",
    "modelUrl must be a string or null",
  );
  if (json.modelUrl !== null) {
    assert.ok(json.modelUrl.endsWith(".glb"), "modelUrl must point to a .glb file");
  }
});
