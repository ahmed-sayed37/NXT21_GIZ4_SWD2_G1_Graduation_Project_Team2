const DB_KEY = "social_app_db_v1";
const DEFAULT_PHOTO =
  "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg";

function loadDb() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) return JSON.parse(raw);
  return seedDb();
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function seedDb() {
  const demoUser = {
    _id: "demo_user",
    name: "Demo User",
    email: "demo@demo.com",
    password: "Demo@123",
    photo: DEFAULT_PHOTO,
    gender: "male",
    dateOfBirth: "1995-01-01",
  };
  const db = {
    users: [demoUser],
    posts: [
      {
        id: "post_welcome",
        body: "Welcome to the Social App! Sign up to share your own posts.",
        image: null,
        createdAt: new Date().toISOString(),
        user: { _id: demoUser._id, name: demoUser.name, photo: demoUser.photo },
        comments: [],
      },
    ],
  };
  saveDb(db);
  return db;
}

function delay(ms = 250) {
  return new Promise((r) => setTimeout(r, ms));
}

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function makeToken(userId) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ user: userId, iat: Date.now() }));
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

export async function signup(data) {
  await delay();
  const db = loadDb();
  if (db.users.find((u) => u.email === data.email)) {
    apiError("Email already exists", 409);
  }
  db.users.push({
    _id: uid("u_"),
    name: data.name,
    email: data.email,
    password: data.password,
    photo: DEFAULT_PHOTO,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
  });
  saveDb(db);
  return { data: { message: "success" } };
}

export async function signin({ email, password }) {
  await delay();
  const db = loadDb();
  const user = db.users.find((u) => u.email === email);
  if (!user) apiError("Email not registered", 404);
  if (user.password !== password) apiError("Wrong password", 401);
  return { data: { message: "success", token: makeToken(user._id) } };
}

export async function getPosts(limit = 20) {
  await delay();
  const db = loadDb();
  const posts = [...db.posts]
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

export async function getUserPosts(userId, limit = 20) {
  await delay();
  const db = loadDb();
  const posts = db.posts
    .filter((p) => p.user._id === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
  return { data: { posts } };
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
    user: { _id: user._id, name: user.name, photo: user.photo },
    comments: [],
  };
  db.posts.push(post);
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
    commentCreator: { _id: user._id, name: user.name, photo: user.photo },
    post: postId,
  };
  post.comments.push(comment);
  saveDb(db);
  return { data: { comment } };
}
