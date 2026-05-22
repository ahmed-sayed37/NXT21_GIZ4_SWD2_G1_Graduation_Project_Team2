# How to Build & Run

DEPI Graduation Project — Team 2 · Social Connect.

A React 19 + Vite single-page app. The backend is **fully mocked in the browser via `localStorage`** — no server, no database, no API keys. Just `npm install` and go.

---

## 1. Requirements

| Tool | Version |
|------|---------|
| Node.js | **v18 or newer** (tested on v20) |
| npm | **v9+** (ships with Node 18) |
| A modern browser | Chrome / Firefox / Edge / Safari (any version from the last 2 years) |

Check with:

```bash
node -v
npm -v
```

---

## 2. Install

From the project root:

```bash
npm install
```

This installs ~558 packages (≈40 seconds on a normal connection). Only needs to be run once, or after pulling new changes.

---

## 3. Run the development server

```bash
npm run dev
```

You'll see something like:

```
  VITE v7.1.5  ready in 1.5s

  ➜  Local:   http://localhost:5173/NXT21_GIZ4_SWD2_G1_Graduation_Project_Team2/
```

Open that **full URL** (note the trailing path — it's the GitHub Pages base path baked into `vite.config.js`).

Stop the server with `Ctrl + C`.

If port `5173` is busy, Vite will pick the next free port (`5174`, `5175`, …) — open whatever URL it prints.

### Log in with a seeded account

| Name | Email | Password |
|------|-------|----------|
| **Asser Abdelfattah** (main) | `asser@depi.com` | `Asser@123` |
| Abdellah Mohamed | `abdellah@depi.com` | `Abdellah@123` |
| Ahmed Alsayed | `ahmed@depi.com` | `Ahmed@123` |
| Omar Khaled | `omar@depi.com` | `Omar@123` |
| Laila Saeed | `laila@depi.com` | `Laila@123` |
| Yousef Mahmoud | `yousef@depi.com` | `Yousef@123` |
| Norhan Adel | `norhan@depi.com` | `Norhan@123` |
| Mariam Hany | `mariam@depi.com` | `Mariam@123` |

Email is case-insensitive. Passwords are case-sensitive. You can also **Register** a new account from the login page.

---

## 4. Build for production

```bash
npm run build
```

Produces the optimized bundle in `dist/`. Output is roughly:

| File | Size (gzipped) |
|------|---------------:|
| `index.html` | ~0.35 KB |
| `index-*.css` | ~12 KB |
| Main JS bundle | ~143 KB |
| Lazy chunks (one per page) | ~1–3 KB each |

The `dist/` folder can be deployed to any static host (GitHub Pages, Netlify, Vercel, S3, Nginx). The `base` path in `vite.config.js` is currently set to `/NXT21_GIZ4_SWD2_G1_Graduation_Project_Team2/` for GitHub Pages — change it to `"/"` if you deploy at a domain root.

### Preview the production build locally

```bash
npm run preview
```

Serves `dist/` on a fresh local port — useful for confirming the production build before deploying.

---

## 5. Lint

```bash
npm run lint
```

Runs ESLint on the whole project. Should print nothing on success.

---

## 6. Smoke tests (optional)

End-to-end tests against the mock API. Runs in Node, no browser needed:

```bash
node scripts/smoke-test.mjs
```

Expected: **54 passed, 0 failed**. Covers:

- Login for all 8 users (+ wrong password & unknown email rejected)
- Posts: feed, search, create, edit, delete, ownership checks
- Likes & comments
- Friends: send, accept, reject, cancel, unfriend, auto-accept on cross-request
- People discovery & nearby filter
- Profile / friend status (SELF, FRIENDS, REQUEST_SENT, REQUEST_RECEIVED)
- Settings: update name / bio / location, propagation to existing posts
- Chat: conversations, send, receive, unread, mark-as-read, validation

And a separate stale-data simulation:

```bash
node scripts/stale-login-test.mjs
```

Expected: **10 passed**. Simulates legacy `localStorage` data and confirms the self-healing loader.

---

## 7. Project structure

```
.
├── index.html               # Vite entry HTML
├── package.json
├── vite.config.js           # base path for GitHub Pages
├── README.md
├── RUN.md                   # this file
├── scripts/
│   ├── smoke-test.mjs       # end-to-end API tests (Node)
│   └── stale-login-test.mjs # legacy-data simulation
└── src/
    ├── main.jsx             # bootstraps React
    ├── App.jsx              # router + providers
    ├── index.css            # Tailwind v4 + custom dark variant
    ├── api/
    │   └── mockApi.js       # all "backend" logic — auth, posts, friends, chat
    ├── context/
    │   ├── AuthContext.jsx  # token + current user
    │   └── ThemeContext.jsx # light/dark mode
    ├── hooks/
    │   └── useDocumentTitle.js
    ├── lib/
    │   └── relativeTime.js  # Intl.RelativeTimeFormat helper
    └── Components/
        ├── Layout/          # 3-column shell
        ├── Navbar/
        ├── LeftSidebar/     # desktop nav
        ├── BottomNav/       # mobile bottom tabs
        ├── RightRail/       # suggestions + your friends
        ├── Footer/
        ├── Home/
        ├── PostCard/
        ├── PostDetails/
        ├── CreatePost/
        ├── CommentCard/
        ├── Profile/
        │   ├── Profile.jsx
        │   └── EditProfileModal.jsx
        ├── People/          # discover + nearby filter
        ├── Friends/         # friends + incoming + outgoing
        ├── Chat/            # conversation list + thread
        ├── Settings/
        ├── Login/
        ├── Register/
        ├── PersonCard/
        ├── FriendButton/
        ├── Skeleton/
        ├── Modal/
        ├── ErrorBoundary/
        ├── LoadingScreen/
        ├── GuestRoute/
        ├── ProtectedRoute/
        └── InputLabel.jsx
```

---

## 8. Where the data lives

There is **no server**. Everything you do (sign up, post, like, comment, friend, message) is stored in **your browser's `localStorage`** under the key `social_app_db_v4`.

That means:

- Data is **per-browser** — clearing storage = fresh seed.
- Two browser tabs share the same data (polling makes chat feel live across tabs).
- Two different browsers / devices are **isolated** — they each get their own seeded copy.

### Reset data manually

Open DevTools (`F12`) → **Application** → **Local Storage** → `http://localhost:5173` → delete the keys, then refresh. The loader will re-seed from scratch.

You can also reset programmatically from the browser console:

```js
localStorage.clear();
location.reload();
```

---

## 9. Tech stack

| Layer | Library |
|-------|---------|
| Framework | React 19 + Vite 7 |
| Router | React Router DOM v7 |
| Data fetching / cache | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS v4 + HeroUI |
| Toasts | react-hot-toast |
| Token decoding | jwt-decode |
| Mock backend | hand-rolled in `src/api/mockApi.js` |

---

## 10. Common scripts (cheat sheet)

```bash
npm install              # install dependencies
npm run dev              # start dev server (hot reload)
npm run build            # build for production -> dist/
npm run preview          # serve dist/ locally
npm run lint             # ESLint
node scripts/smoke-test.mjs        # end-to-end API tests (54 cases)
node scripts/stale-login-test.mjs  # legacy-data migration tests (10 cases)
```

---

## 11. Troubleshooting

| Symptom | Fix |
|---------|-----|
| Blank page at `http://localhost:5173/` | You need the **full path**: `http://localhost:5173/NXT21_GIZ4_SWD2_G1_Graduation_Project_Team2/` |
| "Email not registered" for a seeded user | Hard refresh (`Ctrl + F5`). The loader self-heals on every load. |
| `EADDRINUSE: 5173 is in use` | Vite will use the next free port — open whichever URL it prints. Or stop the old server with `Ctrl + C`. |
| Want to start from scratch | DevTools → Application → Local Storage → delete everything for `localhost:5173` → refresh. |
| Build warns about chunk size | The Tailwind/HeroUI bundle is ~485 KB raw / ~143 KB gzipped. Pages are already lazy-loaded; further splitting would require code reorganization. |

---

## 12. Deploying to GitHub Pages

```bash
npm run build
# push the dist/ folder to the gh-pages branch
# (or use a deploy action — .github/ already contains the scaffolding)
```

The `base` path in `vite.config.js` (`/NXT21_GIZ4_SWD2_G1_Graduation_Project_Team2/`) matches the repo name, so the app loads correctly on `https://<your-user>.github.io/NXT21_GIZ4_SWD2_G1_Graduation_Project_Team2/`.

---

That's it. `npm install && npm run dev` and you're up.
