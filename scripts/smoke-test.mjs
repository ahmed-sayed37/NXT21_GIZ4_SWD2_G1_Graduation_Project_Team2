// End-to-end smoke test for the mock API.
// Runs in Node by shimming localStorage + atob/btoa + FileReader.
//
//   node scripts/smoke-test.mjs

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
// atob/btoa are available natively in Node 16+, but be defensive
globalThis.btoa ??= (s) => Buffer.from(s, "binary").toString("base64");
globalThis.atob ??= (s) => Buffer.from(s, "base64").toString("binary");
globalThis.FileReader = class { /* unused in tests */ };

const api = await import("../src/api/mockApi.js");

const failures = [];
let passed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failures.push({ name, err });
    console.log(`  ✗ ${name}\n      ${err.message}`);
  }
}
function section(name) {
  console.log(`\n— ${name} —`);
}

async function loginAs(email, password) {
  const res = await api.signin({ email, password });
  localStorage.setItem("tkn", res.data.token);
  return res.data.token;
}

const USERS = [
  { name: "Asser Abdelfattah", email: "asser@depi.com", pw: "Asser@123", id: "asser_user", city: "Cairo" },
  { name: "Abdellah Mohamed", email: "abdellah@depi.com", pw: "Abdellah@123", id: "abdellah_user", city: "Cairo" },
  { name: "Ahmed Alsayed", email: "ahmed@depi.com", pw: "Ahmed@123", id: "ahmed_user", city: "Cairo" },
  { name: "Omar Khaled", email: "omar@depi.com", pw: "Omar@123", id: "omar_user", city: "Alexandria" },
  { name: "Laila Saeed", email: "laila@depi.com", pw: "Laila@123", id: "laila_user", city: "Cairo" },
  { name: "Yousef Mahmoud", email: "yousef@depi.com", pw: "Yousef@123", id: "yousef_user", city: "Giza" },
  { name: "Norhan Adel", email: "norhan@depi.com", pw: "Norhan@123", id: "norhan_user", city: "Alexandria" },
  { name: "Mariam Hany", email: "mariam@depi.com", pw: "Mariam@123", id: "mariam_user", city: "Mansoura" },
];

section("Login (all 8 seeded users)");
for (const u of USERS) {
  await test(`signin ${u.email}`, async () => {
    const token = await loginAs(u.email, u.pw);
    assert.ok(token, "got token");
    const cur = await api.getCurrentUser();
    assert.equal(cur.data.user._id, u.id);
    assert.equal(cur.data.user.email, u.email);
    assert.equal(cur.data.user.name, u.name);
    assert.equal(cur.data.user.location, u.city);
  });
}
await test("wrong password rejected", async () => {
  await assert.rejects(api.signin({ email: "asser@depi.com", password: "bad" }), /Wrong password/);
});
await test("unknown email rejected", async () => {
  await assert.rejects(api.signin({ email: "nope@nope.com", password: "x" }), /Email not registered/);
});

section("Home feed");
await loginAs("asser@depi.com", "Asser@123");
await test("getPosts returns seeded posts (>=5)", async () => {
  const res = await api.getPosts();
  assert.ok(res.data.posts.length >= 5, `got ${res.data.posts.length} posts`);
});
await test("getPosts ordered newest-first", async () => {
  const res = await api.getPosts();
  const times = res.data.posts.map((p) => new Date(p.createdAt).getTime());
  for (let i = 1; i < times.length; i++) assert.ok(times[i - 1] >= times[i]);
});
await test("getPosts q filter (text)", async () => {
  const res = await api.getPosts({ q: "graduation" });
  assert.ok(res.data.posts.length >= 1);
});
await test("getPosts q filter (author name)", async () => {
  const res = await api.getPosts({ q: "Ahmed" });
  assert.ok(res.data.posts.every((p) => p.body.toLowerCase().includes("ahmed") || p.user.name.toLowerCase().includes("ahmed")));
});

section("Create / edit / delete post");
let myPostId;
await test("create post (text only)", async () => {
  const res = await api.createPost({ body: "smoke test post from Asser" });
  myPostId = res.data.post.id;
  assert.equal(res.data.post.user._id, "asser_user");
  assert.equal(res.data.post.likes.length, 0);
  assert.equal(res.data.post.comments.length, 0);
});
await test("getPost returns it", async () => {
  const r = await api.getPost(myPostId);
  assert.equal(r.data.post.id, myPostId);
});
await test("editPost (owner)", async () => {
  const r = await api.editPost({ id: myPostId, body: "edited body" });
  assert.equal(r.data.post.body, "edited body");
});
await test("editPost (non-owner forbidden)", async () => {
  await loginAs("ahmed@depi.com", "Ahmed@123");
  await assert.rejects(api.editPost({ id: myPostId, body: "hack" }), /your own posts/);
  await loginAs("asser@depi.com", "Asser@123");
});
await test("deletePost (non-owner forbidden)", async () => {
  await loginAs("ahmed@depi.com", "Ahmed@123");
  await assert.rejects(api.deletePost(myPostId), /your own posts/);
  await loginAs("asser@depi.com", "Asser@123");
});

section("Likes");
await test("like toggles add", async () => {
  const r = await api.toggleLike(myPostId);
  assert.equal(r.data.liked, true);
  assert.deepEqual(r.data.likes, ["asser_user"]);
});
await test("like toggles remove", async () => {
  const r = await api.toggleLike(myPostId);
  assert.equal(r.data.liked, false);
  assert.deepEqual(r.data.likes, []);
});
await test("other user can like", async () => {
  await loginAs("abdellah@depi.com", "Abdellah@123");
  const r = await api.toggleLike(myPostId);
  assert.equal(r.data.liked, true);
  await loginAs("asser@depi.com", "Asser@123");
});

section("Comments");
let myCommentId;
await test("addComment", async () => {
  const r = await api.addComment({ postId: myPostId, content: "first comment" });
  myCommentId = r.data.comment._id;
  assert.equal(r.data.comment.commentCreator._id, "asser_user");
});
await test("editComment (owner)", async () => {
  const r = await api.editComment({ commentId: myCommentId, postId: myPostId, content: "edited comment" });
  assert.equal(r.data.comment.content, "edited comment");
});
await test("editComment (non-owner forbidden)", async () => {
  await loginAs("ahmed@depi.com", "Ahmed@123");
  await assert.rejects(
    api.editComment({ commentId: myCommentId, postId: myPostId, content: "x" }),
    /your own comments/
  );
  await loginAs("asser@depi.com", "Asser@123");
});
await test("deleteComment (owner)", async () => {
  await api.deleteComment({ commentId: myCommentId, postId: myPostId });
  const r = await api.getPost(myPostId);
  assert.equal(r.data.post.comments.find((c) => c._id === myCommentId), undefined);
});

section("Friends");
await loginAs("asser@depi.com", "Asser@123");
await test("incoming requests present from seed", async () => {
  const r = await api.listIncomingRequests();
  assert.ok(r.data.requests.length >= 2);
});
await test("listFriends has Abdellah + Ahmed by default", async () => {
  const r = await api.listFriends();
  const ids = r.data.friends.map((f) => f._id).sort();
  assert.deepEqual(ids, ["abdellah_user", "ahmed_user"]);
});
await test("accept Laila request", async () => {
  await api.respondToRequest({ fromUserId: "laila_user", accept: true });
  const r = await api.listFriends();
  assert.ok(r.data.friends.find((f) => f._id === "laila_user"));
});
await test("reject Yousef request", async () => {
  await api.respondToRequest({ fromUserId: "yousef_user", accept: false });
  const inc = await api.listIncomingRequests();
  assert.ok(!inc.data.requests.find((r) => r.from === "yousef_user"));
});
await test("send request to Omar", async () => {
  const r = await api.sendFriendRequest("omar_user");
  assert.equal(r.data.sent, true);
  const out = await api.listOutgoingRequests();
  assert.ok(out.data.requests.find((r) => r.to === "omar_user"));
});
await test("cancel outgoing to Omar", async () => {
  await api.cancelFriendRequest("omar_user");
  const out = await api.listOutgoingRequests();
  assert.ok(!out.data.requests.find((r) => r.to === "omar_user"));
});
await test("send + auto-accept (mutual cross request)", async () => {
  // Mariam sends to Asser
  await loginAs("mariam@depi.com", "Mariam@123");
  await api.sendFriendRequest("asser_user");
  // Asser logs back in and sends to Mariam — should auto-friend
  await loginAs("asser@depi.com", "Asser@123");
  const r = await api.sendFriendRequest("mariam_user");
  assert.equal(r.data.friended, true);
  const friends = await api.listFriends();
  assert.ok(friends.data.friends.find((f) => f._id === "mariam_user"));
});
await test("unfriend works both sides", async () => {
  await api.removeFriend("mariam_user");
  const a = await api.listFriends();
  assert.ok(!a.data.friends.find((f) => f._id === "mariam_user"));
  await loginAs("mariam@depi.com", "Mariam@123");
  const m = await api.listFriends();
  assert.ok(!m.data.friends.find((f) => f._id === "asser_user"));
  await loginAs("asser@depi.com", "Asser@123");
});
await test("cannot friend yourself", async () => {
  await assert.rejects(api.sendFriendRequest("asser_user"), /yourself/);
});

section("People discovery & nearby");
await test("listPeople excludes current user", async () => {
  const r = await api.listPeople();
  assert.ok(!r.data.people.find((p) => p._id === "asser_user"));
});
await test("nearby (Cairo) only returns Cairo users", async () => {
  const r = await api.listPeople({ location: "Cairo" });
  assert.ok(r.data.people.every((p) => p.location === "Cairo"));
  assert.ok(r.data.people.length >= 1);
});
await test("search by name 'Omar' finds Omar", async () => {
  const r = await api.listPeople({ q: "omar" });
  assert.ok(r.data.people.find((p) => p._id === "omar_user"));
});
await test("listLocations returns distinct sorted cities", async () => {
  const r = await api.listLocations();
  assert.ok(r.data.locations.includes("Cairo"));
  assert.ok(r.data.locations.includes("Alexandria"));
  const sorted = [...r.data.locations].sort();
  assert.deepEqual(r.data.locations, sorted);
});
await test("suggestions returned", async () => {
  const r = await api.getSuggestions(4);
  assert.ok(r.data.suggestions.length > 0);
  assert.ok(r.data.suggestions.every((s) => s._id !== "asser_user"));
});

section("Profile / friend status");
await test("getUserById SELF status for me", async () => {
  const r = await api.getUserById("asser_user");
  assert.equal(r.data.friendStatus, api.FRIEND_STATUS.SELF);
});
await test("FRIENDS status for Abdellah", async () => {
  const r = await api.getUserById("abdellah_user");
  assert.equal(r.data.friendStatus, api.FRIEND_STATUS.FRIENDS);
});
await test("REQUEST_SENT after sending", async () => {
  await api.sendFriendRequest("yousef_user");
  const r = await api.getUserById("yousef_user");
  assert.equal(r.data.friendStatus, api.FRIEND_STATUS.REQUEST_SENT);
});
await test("REQUEST_RECEIVED viewable from the other side", async () => {
  await loginAs("yousef@depi.com", "Yousef@123");
  const r = await api.getUserById("asser_user");
  assert.equal(r.data.friendStatus, api.FRIEND_STATUS.REQUEST_RECEIVED);
  await loginAs("asser@depi.com", "Asser@123");
});

section("Settings / profile update");
await test("updateProfile changes name + bio + location", async () => {
  const r = await api.updateProfile({ name: "Asser A.", bio: "Updated", location: "Giza" });
  assert.equal(r.data.user.name, "Asser A.");
  assert.equal(r.data.user.bio, "Updated");
  assert.equal(r.data.user.location, "Giza");
});
await test("name change propagates to existing posts", async () => {
  const post = await api.getPost(myPostId);
  assert.equal(post.data.post.user.name, "Asser A.");
});
// restore
await api.updateProfile({ name: "Asser Abdelfattah", bio: "Frontend developer · React · Graduation Project Team 2 (DEPI).", location: "Cairo" });

section("Chat");
await test("seed gives Asser conversations", async () => {
  const r = await api.listConversations();
  assert.ok(r.data.conversations.length >= 2, `got ${r.data.conversations.length}`);
});
await test("Asser has unread messages from seed", async () => {
  const r = await api.getUnreadMessagesCount();
  assert.ok(r.data.count > 0);
});
let chatMsgId;
await test("send message Asser → Ahmed", async () => {
  const r = await api.sendMessage({ to: "ahmed_user", content: "yo" });
  chatMsgId = r.data.message.id;
  assert.equal(r.data.message.from, "asser_user");
  assert.equal(r.data.message.to, "ahmed_user");
});
await test("Ahmed sees the message + as unread", async () => {
  await loginAs("ahmed@depi.com", "Ahmed@123");
  const r = await api.getMessages("asser_user");
  assert.ok(r.data.messages.find((m) => m.id === chatMsgId));
  const u = await api.getUnreadMessagesCount();
  assert.ok(u.data.count >= 1);
});
await test("markConversationRead clears unread", async () => {
  await api.markConversationRead("asser_user");
  const r = await api.getMessages("asser_user");
  const msg = r.data.messages.find((m) => m.id === chatMsgId);
  assert.equal(msg.read, true);
  await loginAs("asser@depi.com", "Asser@123");
});
await test("can't message yourself", async () => {
  await assert.rejects(api.sendMessage({ to: "asser_user", content: "hi" }), /yourself/);
});
await test("empty message rejected", async () => {
  await assert.rejects(api.sendMessage({ to: "ahmed_user", content: "   " }), /empty/);
});

section("Cleanup");
await test("delete my smoke post", async () => {
  const r = await api.deletePost(myPostId);
  assert.ok(r.data.message);
});

section("Summary");
console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  for (const f of failures) console.log(`  ✗ ${f.name}: ${f.err.message}`);
  process.exit(1);
}
