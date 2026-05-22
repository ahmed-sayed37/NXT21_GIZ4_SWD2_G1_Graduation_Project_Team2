const DB_KEY = "social_app_db_v4";
const LEGACY_KEYS = ["social_app_db_v3", "social_app_db_v2", "social_app_db_v1"];

export const DEFAULT_PHOTO =
  "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg";

export const FRIEND_STATUS = {
  NONE: "none",
  FRIENDS: "friends",
  REQUEST_SENT: "request_sent",
  REQUEST_RECEIVED: "request_received",
  SELF: "self",
};

function migrateLegacy() {
  for (const key of LEGACY_KEYS) {
    const legacy = localStorage.getItem(key);
    if (!legacy) continue;
    try {
      const db = JSON.parse(legacy);
      db.users = (db.users || []).map((u) => ({
        bio: "",
        location: "",
        friends: [],
        ...u,
        email: typeof u.email === "string" ? u.email.replace(/@demo\.com$/, "@depi.com") : u.email,
      }));
      db.posts = (db.posts || []).map((p) => ({ likes: [], ...p }));
      db.friendRequests = db.friendRequests || [];
      return db;
    } catch {
      // try next legacy key
    }
  }
  return null;
}

const STALE_USER_IDS = new Set(["demo_user", "alice_user"]);

function selfHeal(db) {
  let touched = false;

  db.users = db.users || [];
  db.posts = db.posts || [];
  db.friendRequests = db.friendRequests || [];
  db.messages = db.messages || [];

  // Drop legacy stale demo users entirely.
  const before = db.users.length;
  db.users = db.users.filter((u) => !STALE_USER_IDS.has(u._id));
  if (db.users.length !== before) touched = true;

  // Rewrite stale email domains + backfill missing fields.
  db.users.forEach((u) => {
    if (typeof u.email === "string" && u.email.endsWith("@demo.com")) {
      u.email = u.email.replace(/@demo\.com$/, "@depi.com");
      touched = true;
    }
    if (!Array.isArray(u.friends)) {
      u.friends = [];
      touched = true;
    } else {
      const prev = u.friends.length;
      u.friends = u.friends.filter((fid) => !STALE_USER_IDS.has(fid));
      if (u.friends.length !== prev) touched = true;
    }
    if (typeof u.location !== "string") {
      u.location = "";
      touched = true;
    }
    if (typeof u.bio !== "string") {
      u.bio = "";
      touched = true;
    }
  });

  // Drop posts authored by stale users, and clean comments by stale users.
  const postsBefore = db.posts.length;
  db.posts = db.posts.filter((p) => !STALE_USER_IDS.has(p.user?._id));
  if (db.posts.length !== postsBefore) touched = true;
  db.posts.forEach((p) => {
    const cBefore = p.comments.length;
    p.comments = p.comments.filter(
      (c) => !STALE_USER_IDS.has(c.commentCreator?._id)
    );
    if (p.comments.length !== cBefore) touched = true;
    const lBefore = (p.likes || []).length;
    p.likes = (p.likes || []).filter((id) => !STALE_USER_IDS.has(id));
    if ((p.likes || []).length !== lBefore) touched = true;
  });

  // Drop friend requests involving stale users.
  const frBefore = db.friendRequests.length;
  db.friendRequests = db.friendRequests.filter(
    (r) => !STALE_USER_IDS.has(r.from) && !STALE_USER_IDS.has(r.to)
  );
  if (db.friendRequests.length !== frBefore) touched = true;

  // Drop messages involving stale users.
  const msgBefore = db.messages.length;
  db.messages = db.messages.filter(
    (m) => !STALE_USER_IDS.has(m.from) && !STALE_USER_IDS.has(m.to)
  );
  if (db.messages.length !== msgBefore) touched = true;

  // Make sure every canonical seed user exists (so login always works).
  const seedUsers = buildSeedUsers();
  const knownIds = new Set(db.users.map((u) => u._id));
  for (const seed of seedUsers) {
    if (!knownIds.has(seed._id)) {
      db.users.push(seed);
      touched = true;
    }
  }

  return touched;
}

function loadDb() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    const db = JSON.parse(raw);
    if (selfHeal(db)) saveDb(db);
    return db;
  }
  const migrated = migrateLegacy();
  if (migrated) {
    selfHeal(migrated);
    saveDb(migrated);
    return migrated;
  }
  return seedDb();
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function resetDemoData() {
  localStorage.removeItem(DB_KEY);
  for (const k of LEGACY_KEYS) localStorage.removeItem(k);
  localStorage.removeItem("tkn");
}

function buildSeedUsers() {
  return [
    {
      _id: "asser_user",
      name: "Asser Abdelfattah",
      email: "asser@depi.com",
      password: "Asser@123",
      photo: DEFAULT_PHOTO,
      gender: "male",
      dateOfBirth: "2000-05-21",
      bio: "Frontend developer · React · Graduation Project Team 2 (DEPI).",
      location: "Cairo",
      friends: ["abdellah_user", "ahmed_user"],
    },
    {
      _id: "abdellah_user",
      name: "Abdellah Mohamed",
      email: "abdellah@depi.com",
      password: "Abdellah@123",
      photo: DEFAULT_PHOTO,
      gender: "male",
      dateOfBirth: "1999-09-14",
      bio: "Software engineer. Loves clean code and tea.",
      location: "Cairo",
      friends: ["asser_user", "ahmed_user"],
    },
    {
      _id: "ahmed_user",
      name: "Ahmed Alsayed",
      email: "ahmed@depi.com",
      password: "Ahmed@123",
      photo: DEFAULT_PHOTO,
      gender: "male",
      dateOfBirth: "1998-12-02",
      bio: "Full-stack developer. JS, Node, and a lot of coffee ☕.",
      location: "Cairo",
      friends: ["asser_user", "abdellah_user"],
    },
    {
      _id: "omar_user",
      name: "Omar Khaled",
      email: "omar@depi.com",
      password: "Omar@123",
      photo: DEFAULT_PHOTO,
      gender: "male",
      dateOfBirth: "1997-02-08",
      bio: "Backend engineer. Bikes & football.",
      location: "Alexandria",
      friends: [],
    },
    {
      _id: "laila_user",
      name: "Laila Saeed",
      email: "laila@depi.com",
      password: "Laila@123",
      photo: DEFAULT_PHOTO,
      gender: "female",
      dateOfBirth: "1999-11-03",
      bio: "Photographer in Cairo.",
      location: "Cairo",
      friends: [],
    },
    {
      _id: "yousef_user",
      name: "Yousef Mahmoud",
      email: "yousef@depi.com",
      password: "Yousef@123",
      photo: DEFAULT_PHOTO,
      gender: "male",
      dateOfBirth: "1995-07-21",
      bio: "Frontend dev. Coffee snob.",
      location: "Giza",
      friends: [],
    },
    {
      _id: "norhan_user",
      name: "Norhan Adel",
      email: "norhan@depi.com",
      password: "Norhan@123",
      photo: DEFAULT_PHOTO,
      gender: "female",
      dateOfBirth: "1996-09-30",
      bio: "Product manager and book hoarder.",
      location: "Alexandria",
      friends: [],
    },
    {
      _id: "mariam_user",
      name: "Mariam Hany",
      email: "mariam@depi.com",
      password: "Mariam@123",
      photo: DEFAULT_PHOTO,
      gender: "female",
      dateOfBirth: "2001-04-18",
      bio: "UI/UX designer.",
      location: "Mansoura",
      friends: [],
    },
  ];
}

function seedDb() {
  const [asser, abdellah, ahmed, omar, laila, _yousef, _norhan, _mariam] = buildSeedUsers();
  void _yousef; void _norhan; void _mariam;

  const now = Date.now();
  const db = {
    users: buildSeedUsers(),
    friendRequests: [
      { id: "fr_seed_1", from: "laila_user", to: "asser_user", createdAt: new Date(now - 3600_000).toISOString() },
      { id: "fr_seed_2", from: "yousef_user", to: "asser_user", createdAt: new Date(now - 7200_000).toISOString() },
    ],
    messages: [
      { id: "m_seed_1", from: "abdellah_user", to: "asser_user", content: "Hey Asser, how's the final demo going?", createdAt: new Date(now - 1000 * 60 * 60).toISOString(), read: false },
      { id: "m_seed_2", from: "asser_user", to: "abdellah_user", content: "Almost there. Just polishing the UI 👌", createdAt: new Date(now - 1000 * 60 * 58).toISOString(), read: true },
      { id: "m_seed_3", from: "abdellah_user", to: "asser_user", content: "Nice — share a screenshot when you can", createdAt: new Date(now - 1000 * 60 * 50).toISOString(), read: false },
      { id: "m_seed_4", from: "ahmed_user", to: "asser_user", content: "Team meeting at 7?", createdAt: new Date(now - 1000 * 60 * 20).toISOString(), read: false },
    ],
    posts: [
      {
        id: "post_welcome",
        body: "Welcome to Social Connect! Like, comment, add friends, and find people in your area.",
        image: null,
        createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
        user: pickPublicUser(asser),
        comments: [
          {
            _id: "c_welcome_1",
            content: "Looking sharp!",
            createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
            commentCreator: pickPublicUser(abdellah),
            post: "post_welcome",
          },
        ],
        likes: ["abdellah_user", "ahmed_user"],
      },
      {
        id: "post_ahmed_1",
        body: "Pushed the final version of our graduation project today. Big day for Team 2 🎓",
        image: null,
        createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
        user: pickPublicUser(ahmed),
        comments: [],
        likes: ["asser_user", "abdellah_user"],
      },
      {
        id: "post_abdellah_1",
        body: "React 19 + Tailwind v4 = pure joy. Highly recommended stack.",
        image: null,
        createdAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
        user: pickPublicUser(abdellah),
        comments: [],
        likes: ["asser_user"],
      },
      {
        id: "post_omar_1",
        body: "Cycling on the Corniche this morning — Alex is wonderful at sunrise.",
        image: null,
        createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
        user: pickPublicUser(omar),
        comments: [],
        likes: [],
      },
      {
        id: "post_laila_1",
        body: "Shot some street photography downtown Cairo today. The light was unreal.",
        image: null,
        createdAt: new Date(now - 1000 * 60 * 60 * 7).toISOString(),
        user: pickPublicUser(laila),
        comments: [],
        likes: [],
      },
    ],
  };
  saveDb(db);
  return db;
}

function pickPublicUser(u) {
  return { _id: u._id, name: u.name, photo: u.photo };
}

function delay(ms = 150) {
  return new Promise((r) => setTimeout(r, ms));
}

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function makeToken(userId) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({ user: userId, iat: Date.now(), exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })
  );
  const signature = btoa("mock-signature");
  return `${header}.${payload}.${signature}`;
}

function getCurrentUserId() {
  const token = localStorage.getItem("tkn");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user;
  } catch {
    return null;
  }
}

function apiError(message, status = 400) {
  const err = new Error(message);
  err.response = { status, data: { error: message } };
  throw err;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function syncEmbeddedUser(db, user) {
  const pub = pickPublicUser(user);
  db.posts.forEach((p) => {
    if (p.user._id === user._id) p.user = pub;
    p.comments.forEach((c) => {
      if (c.commentCreator._id === user._id) c.commentCreator = pub;
    });
  });
}

function stripPassword(u) {
  const { password: _pw, ...safe } = u;
  return safe;
}

function friendStatusBetween(db, viewerId, otherId) {
  if (!viewerId) return FRIEND_STATUS.NONE;
  if (viewerId === otherId) return FRIEND_STATUS.SELF;
  const viewer = db.users.find((u) => u._id === viewerId);
  if (viewer?.friends?.includes(otherId)) return FRIEND_STATUS.FRIENDS;
  const outgoing = db.friendRequests.find((r) => r.from === viewerId && r.to === otherId);
  if (outgoing) return FRIEND_STATUS.REQUEST_SENT;
  const incoming = db.friendRequests.find((r) => r.from === otherId && r.to === viewerId);
  if (incoming) return FRIEND_STATUS.REQUEST_RECEIVED;
  return FRIEND_STATUS.NONE;
}

export async function signup(data) {
  await delay();
  const db = loadDb();
  const normalizedEmail = String(data.email || "").trim().toLowerCase();
  if (db.users.find((u) => u.email.toLowerCase() === normalizedEmail)) {
    apiError("Email already exists", 409);
  }
  db.users.push({
    _id: uid("u_"),
    name: data.name,
    email: normalizedEmail,
    password: data.password,
    photo: DEFAULT_PHOTO,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
    bio: "",
    location: data.location || "",
    friends: [],
  });
  saveDb(db);
  return { data: { message: "success" } };
}

export async function signin({ email, password }) {
  await delay();
  const db = loadDb();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) apiError("Email not registered", 404);
  if (user.password !== password) apiError("Wrong password", 401);
  return { data: { message: "success", token: makeToken(user._id) } };
}

export async function getPosts({ limit = 50, q = "" } = {}) {
  await delay();
  const db = loadDb();
  const needle = q.trim().toLowerCase();
  let posts = [...db.posts];
  if (needle) {
    posts = posts.filter(
      (p) =>
        p.body.toLowerCase().includes(needle) ||
        p.user.name.toLowerCase().includes(needle)
    );
  }
  posts = posts
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
  return { data: { posts } };
}

export async function getPost(id) {
  await delay();
  const db = loadDb();
  const post = db.posts.find((p) => p.id === id);
  if (!post) apiError("Post not found", 404);
  return { data: { post } };
}

export async function getUserPosts(userId, limit = 50) {
  await delay();
  const db = loadDb();
  const posts = db.posts
    .filter((p) => p.user._id === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
  return { data: { posts } };
}

export async function getUserById(id) {
  await delay();
  const db = loadDb();
  const user = db.users.find((u) => u._id === id);
  if (!user) apiError("User not found", 404);
  const viewerId = getCurrentUserId();
  return {
    data: {
      user: stripPassword(user),
      friendStatus: friendStatusBetween(db, viewerId, id),
      mutualFriends: viewerId
        ? user.friends.filter((fid) =>
            db.users.find((u) => u._id === viewerId)?.friends?.includes(fid)
          ).length
        : 0,
    },
  };
}

export async function getCurrentUser() {
  const id = getCurrentUserId();
  if (!id) apiError("Not authenticated", 401);
  return getUserById(id);
}

export async function updateProfile({ name, bio, location, photoFile }) {
  await delay();
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);

  const db = loadDb();
  const user = db.users.find((u) => u._id === userId);
  if (!user) apiError("User not found", 404);

  if (typeof name === "string" && name.trim()) user.name = name.trim();
  if (typeof bio === "string") user.bio = bio;
  if (typeof location === "string") user.location = location.trim();
  if (photoFile) user.photo = await fileToDataUrl(photoFile);

  syncEmbeddedUser(db, user);
  saveDb(db);
  return { data: { user: stripPassword(user) } };
}

export async function createPost({ body, imageFile }) {
  await delay();
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);

  const db = loadDb();
  const user = db.users.find((u) => u._id === userId);
  if (!user) apiError("User not found", 404);

  const image = imageFile ? await fileToDataUrl(imageFile) : null;

  const post = {
    id: uid("p_"),
    body: body || "",
    image,
    createdAt: new Date().toISOString(),
    user: pickPublicUser(user),
    comments: [],
    likes: [],
  };
  db.posts.unshift(post);
  saveDb(db);
  return { data: { post } };
}

export async function editPost({ id, body }) {
  await delay();
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);

  const db = loadDb();
  const post = db.posts.find((p) => p.id === id);
  if (!post) apiError("Post not found", 404);
  if (post.user._id !== userId) apiError("You can only edit your own posts", 403);

  post.body = body || "";
  saveDb(db);
  return { data: { post } };
}

export async function deletePost(id) {
  await delay();
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);

  const db = loadDb();
  const post = db.posts.find((p) => p.id === id);
  if (!post) apiError("Post not found", 404);
  if (post.user._id !== userId) apiError("You can only delete your own posts", 403);

  db.posts = db.posts.filter((p) => p.id !== id);
  saveDb(db);
  return { data: { message: "success" } };
}

export async function toggleLike(postId) {
  await delay(80);
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);

  const db = loadDb();
  const post = db.posts.find((p) => p.id === postId);
  if (!post) apiError("Post not found", 404);

  const idx = post.likes.indexOf(userId);
  if (idx === -1) post.likes.push(userId);
  else post.likes.splice(idx, 1);

  saveDb(db);
  return { data: { likes: post.likes, liked: idx === -1 } };
}

export async function addComment({ content, postId }) {
  await delay();
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);

  const db = loadDb();
  const user = db.users.find((u) => u._id === userId);
  if (!user) apiError("User not found", 404);
  const post = db.posts.find((p) => p.id === postId);
  if (!post) apiError("Post not found", 404);

  const comment = {
    _id: uid("c_"),
    content,
    createdAt: new Date().toISOString(),
    commentCreator: pickPublicUser(user),
    post: postId,
  };
  post.comments.push(comment);
  saveDb(db);
  return { data: { comment } };
}

export async function editComment({ commentId, postId, content }) {
  await delay();
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);

  const db = loadDb();
  const post = db.posts.find((p) => p.id === postId);
  if (!post) apiError("Post not found", 404);
  const comment = post.comments.find((c) => c._id === commentId);
  if (!comment) apiError("Comment not found", 404);
  if (comment.commentCreator._id !== userId)
    apiError("You can only edit your own comments", 403);

  comment.content = content;
  saveDb(db);
  return { data: { comment } };
}

export async function deleteComment({ commentId, postId }) {
  await delay();
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);

  const db = loadDb();
  const post = db.posts.find((p) => p.id === postId);
  if (!post) apiError("Post not found", 404);
  const comment = post.comments.find((c) => c._id === commentId);
  if (!comment) apiError("Comment not found", 404);
  if (comment.commentCreator._id !== userId)
    apiError("You can only delete your own comments", 403);

  post.comments = post.comments.filter((c) => c._id !== commentId);
  saveDb(db);
  return { data: { message: "success" } };
}

export async function searchUsers(q, limit = 10) {
  await delay(80);
  const db = loadDb();
  const needle = (q || "").trim().toLowerCase();
  if (!needle) return { data: { users: [] } };
  const users = db.users
    .filter((u) => u.name.toLowerCase().includes(needle))
    .slice(0, limit)
    .map(stripPassword);
  return { data: { users } };
}

/* ---------------- Friends ---------------- */

export async function listPeople({ q = "", location = "", excludeFriends = false } = {}) {
  await delay();
  const db = loadDb();
  const viewerId = getCurrentUserId();
  const viewer = viewerId ? db.users.find((u) => u._id === viewerId) : null;
  const needle = q.trim().toLowerCase();
  const loc = location.trim().toLowerCase();

  let users = db.users.filter((u) => u._id !== viewerId);
  if (needle) {
    users = users.filter(
      (u) =>
        u.name.toLowerCase().includes(needle) ||
        u.location?.toLowerCase().includes(needle)
    );
  }
  if (loc) {
    users = users.filter((u) => (u.location || "").toLowerCase() === loc);
  }
  if (excludeFriends && viewer) {
    users = users.filter((u) => !viewer.friends.includes(u._id));
  }

  const people = users.map((u) => ({
    ...stripPassword(u),
    friendStatus: friendStatusBetween(db, viewerId, u._id),
    mutualFriends: viewer
      ? u.friends.filter((fid) => viewer.friends.includes(fid)).length
      : 0,
  }));

  return { data: { people } };
}

export async function listLocations() {
  await delay(60);
  const db = loadDb();
  const set = new Set(
    db.users.map((u) => (u.location || "").trim()).filter(Boolean)
  );
  return { data: { locations: [...set].sort() } };
}

export async function listFriends(userId) {
  await delay();
  const db = loadDb();
  const targetId = userId || getCurrentUserId();
  if (!targetId) apiError("Not authenticated", 401);
  const target = db.users.find((u) => u._id === targetId);
  if (!target) apiError("User not found", 404);
  const friends = target.friends
    .map((fid) => db.users.find((u) => u._id === fid))
    .filter(Boolean)
    .map(stripPassword);
  return { data: { friends } };
}

export async function listIncomingRequests() {
  await delay();
  const db = loadDb();
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);
  const requests = db.friendRequests
    .filter((r) => r.to === userId)
    .map((r) => {
      const fromUser = db.users.find((u) => u._id === r.from);
      return { ...r, fromUser: fromUser ? stripPassword(fromUser) : null };
    })
    .filter((r) => r.fromUser);
  return { data: { requests } };
}

export async function listOutgoingRequests() {
  await delay();
  const db = loadDb();
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);
  const requests = db.friendRequests
    .filter((r) => r.from === userId)
    .map((r) => {
      const toUser = db.users.find((u) => u._id === r.to);
      return { ...r, toUser: toUser ? stripPassword(toUser) : null };
    })
    .filter((r) => r.toUser);
  return { data: { requests } };
}

export async function sendFriendRequest(toUserId) {
  await delay();
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);
  if (userId === toUserId) apiError("You can't friend yourself", 400);

  const db = loadDb();
  const me = db.users.find((u) => u._id === userId);
  const them = db.users.find((u) => u._id === toUserId);
  if (!them) apiError("User not found", 404);
  if (me.friends.includes(toUserId)) apiError("You are already friends", 400);

  const existing = db.friendRequests.find(
    (r) =>
      (r.from === userId && r.to === toUserId) ||
      (r.from === toUserId && r.to === userId)
  );
  if (existing) {
    if (existing.from === toUserId) {
      // they already sent us one — accept it
      me.friends.push(toUserId);
      them.friends.push(userId);
      db.friendRequests = db.friendRequests.filter((r) => r.id !== existing.id);
      saveDb(db);
      return { data: { friended: true } };
    }
    apiError("Request already sent", 400);
  }

  db.friendRequests.push({
    id: uid("fr_"),
    from: userId,
    to: toUserId,
    createdAt: new Date().toISOString(),
  });
  saveDb(db);
  return { data: { sent: true } };
}

export async function cancelFriendRequest(toUserId) {
  await delay();
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);
  const db = loadDb();
  db.friendRequests = db.friendRequests.filter(
    (r) => !(r.from === userId && r.to === toUserId)
  );
  saveDb(db);
  return { data: { ok: true } };
}

export async function respondToRequest({ fromUserId, accept }) {
  await delay();
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);
  const db = loadDb();
  const req = db.friendRequests.find(
    (r) => r.from === fromUserId && r.to === userId
  );
  if (!req) apiError("Request not found", 404);

  db.friendRequests = db.friendRequests.filter((r) => r.id !== req.id);

  if (accept) {
    const me = db.users.find((u) => u._id === userId);
    const them = db.users.find((u) => u._id === fromUserId);
    if (!them) apiError("User not found", 404);
    if (!me.friends.includes(fromUserId)) me.friends.push(fromUserId);
    if (!them.friends.includes(userId)) them.friends.push(userId);
  }

  saveDb(db);
  return { data: { ok: true, accepted: !!accept } };
}

export async function removeFriend(otherUserId) {
  await delay();
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);
  const db = loadDb();
  const me = db.users.find((u) => u._id === userId);
  const them = db.users.find((u) => u._id === otherUserId);
  if (!me || !them) apiError("User not found", 404);
  me.friends = me.friends.filter((fid) => fid !== otherUserId);
  them.friends = them.friends.filter((fid) => fid !== userId);
  saveDb(db);
  return { data: { ok: true } };
}

export async function getSuggestions(limit = 4) {
  await delay();
  const db = loadDb();
  const viewerId = getCurrentUserId();
  if (!viewerId) return { data: { suggestions: [] } };
  const viewer = db.users.find((u) => u._id === viewerId);
  if (!viewer) return { data: { suggestions: [] } };

  const friendSet = new Set(viewer.friends);
  const outgoing = new Set(
    db.friendRequests.filter((r) => r.from === viewerId).map((r) => r.to)
  );

  const scored = db.users
    .filter(
      (u) =>
        u._id !== viewerId &&
        !friendSet.has(u._id) &&
        !outgoing.has(u._id)
    )
    .map((u) => {
      const mutual = u.friends.filter((fid) => friendSet.has(fid)).length;
      const sameCity = u.location && u.location === viewer.location ? 1 : 0;
      return {
        user: stripPassword(u),
        mutual,
        sameCity,
        score: mutual * 10 + sameCity * 5,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    data: {
      suggestions: scored.map((s) => ({
        ...s.user,
        mutualFriends: s.mutual,
        sameCity: !!s.sameCity,
        friendStatus: friendStatusBetween(db, viewerId, s.user._id),
      })),
    },
  };
}

/* ---------------- Chat ---------------- */

export async function sendMessage({ to, content }) {
  await delay(80);
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);
  if (!to) apiError("Recipient required", 400);
  if (userId === to) apiError("You can't message yourself", 400);
  const text = String(content || "").trim();
  if (!text) apiError("Message can't be empty", 400);

  const db = loadDb();
  if (!db.users.find((u) => u._id === to)) apiError("User not found", 404);

  const msg = {
    id: uid("m_"),
    from: userId,
    to,
    content: text,
    createdAt: new Date().toISOString(),
    read: false,
  };
  db.messages.push(msg);
  saveDb(db);
  return { data: { message: msg } };
}

export async function getMessages(withUserId) {
  await delay(60);
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);
  if (!withUserId) apiError("Conversation user required", 400);
  const db = loadDb();
  const messages = db.messages
    .filter(
      (m) =>
        (m.from === userId && m.to === withUserId) ||
        (m.from === withUserId && m.to === userId)
    )
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const other = db.users.find((u) => u._id === withUserId);
  return {
    data: {
      messages,
      other: other ? stripPassword(other) : null,
    },
  };
}

export async function listConversations() {
  await delay(60);
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);
  const db = loadDb();

  const map = new Map();
  for (const m of db.messages) {
    if (m.from !== userId && m.to !== userId) continue;
    const otherId = m.from === userId ? m.to : m.from;
    const conv = map.get(otherId) || {
      otherId,
      lastMessage: null,
      unread: 0,
    };
    if (!conv.lastMessage || new Date(m.createdAt) > new Date(conv.lastMessage.createdAt)) {
      conv.lastMessage = m;
    }
    if (m.to === userId && !m.read) conv.unread += 1;
    map.set(otherId, conv);
  }

  const conversations = [...map.values()]
    .map((c) => {
      const other = db.users.find((u) => u._id === c.otherId);
      return other
        ? {
            otherId: c.otherId,
            other: stripPassword(other),
            lastMessage: c.lastMessage,
            unread: c.unread,
          }
        : null;
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

  return { data: { conversations } };
}

export async function markConversationRead(otherUserId) {
  await delay(40);
  const userId = getCurrentUserId();
  if (!userId) apiError("Not authenticated", 401);
  const db = loadDb();
  let touched = false;
  for (const m of db.messages) {
    if (m.to === userId && m.from === otherUserId && !m.read) {
      m.read = true;
      touched = true;
    }
  }
  if (touched) saveDb(db);
  return { data: { ok: true } };
}

export async function getUnreadMessagesCount() {
  await delay(40);
  const userId = getCurrentUserId();
  if (!userId) return { data: { count: 0 } };
  const db = loadDb();
  const count = db.messages.filter((m) => m.to === userId && !m.read).length;
  return { data: { count } };
}
