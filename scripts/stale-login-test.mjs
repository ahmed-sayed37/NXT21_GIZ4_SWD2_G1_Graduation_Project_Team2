// Simulates the exact "stale localStorage" situation that was breaking login
// in the user's browser: pretend they had OLD v2 data with `demo_user` only,
// then load the app — login as Asser, Abdellah, Ahmed should still work.

import assert from "node:assert/strict";

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
  clear() { this.map.clear(); }
}
globalThis.localStorage = new MemoryStorage();
globalThis.window = { matchMedia: () => ({ matches: false }) };
globalThis.btoa ??= (s) => Buffer.from(s, "binary").toString("base64");
globalThis.atob ??= (s) => Buffer.from(s, "base64").toString("binary");
globalThis.FileReader = class {};

// Plant stale data that ONLY contains old users (no Asser/Abdellah/Ahmed),
// the way an earlier session of the app would have left it.
const staleV3 = {
  users: [
    {
      _id: "demo_user",
      name: "Demo User",
      email: "demo@demo.com",      // old domain
      password: "Demo@123",
      photo: "x",
      gender: "male",
      dateOfBirth: "1995-01-01",
      bio: "stale",
      // intentionally missing location, friends — should be backfilled
    },
  ],
  posts: [],
  friendRequests: [],
};
localStorage.setItem("social_app_db_v3", JSON.stringify(staleV3));

const api = await import("../src/api/mockApi.js");

const creds = [
  ["asser@depi.com", "Asser@123", "asser_user", "Asser Abdelfattah"],
  ["abdellah@depi.com", "Abdellah@123", "abdellah_user", "Abdellah Mohamed"],
  ["ahmed@depi.com", "Ahmed@123", "ahmed_user", "Ahmed Alsayed"],
  ["omar@depi.com", "Omar@123", "omar_user", "Omar Khaled"],
  ["laila@depi.com", "Laila@123", "laila_user", "Laila Saeed"],
  ["yousef@depi.com", "Yousef@123", "yousef_user", "Yousef Mahmoud"],
  ["norhan@depi.com", "Norhan@123", "norhan_user", "Norhan Adel"],
  ["mariam@depi.com", "Mariam@123", "mariam_user", "Mariam Hany"],
];

let passed = 0;
for (const [email, pw, id, name] of creds) {
  const r = await api.signin({ email, password: pw });
  localStorage.setItem("tkn", r.data.token);
  const me = await api.getCurrentUser();
  assert.equal(me.data.user._id, id);
  assert.equal(me.data.user.name, name);
  console.log(`  ✓ login ${email}`);
  passed++;
}

// And: uppercase email still works
const r = await api.signin({ email: "ASSER@DEPI.COM", password: "Asser@123" });
assert.ok(r.data.token);
console.log("  ✓ uppercase email also works");
passed++;

// And: the stale "demo_user" must be GONE (per product decision)
await assert.rejects(
  api.signin({ email: "demo@depi.com", password: "Demo@123" }),
  /Email not registered/
);
console.log("  ✓ legacy demo_user removed (login correctly rejected)");
passed++;

console.log(`\n${passed} passed`);
