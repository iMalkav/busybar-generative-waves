import assert from "node:assert/strict";
import test from "node:test";
import schema from "../src/appmeta/settings.json" with { type: "json" };
import { AppModel } from "../src/model.ts";
import { schemaDefaults, type Settings } from "../src/lib.ts";
const NOW = 1700000000000;
const make = (values: Settings = {}, saved: Settings = {}, now = NOW) =>
  new AppModel({ ...schemaDefaults(schema.fields), ...values }, saved, now);

test("density is bounded under large encoder deltas", () => {
  const a = make();
  a.key("wheel", 100, NOW);
  assert.equal(a.view(NOW).shapes?.length, 24);
  a.key("wheel", -100, NOW);
  assert.equal(a.view(NOW).shapes?.length, 6);
});
test("pause freezes phase and resume avoids a large time jump", () => {
  const a = make();
  a.key("ok", 0, NOW);
  a.tick(NOW + 10000);
  assert.equal(a.phase, 0);
  a.key("ok", 0, NOW + 10000);
  a.tick(NOW + 10100);
  assert.ok(a.phase < 1);
});
