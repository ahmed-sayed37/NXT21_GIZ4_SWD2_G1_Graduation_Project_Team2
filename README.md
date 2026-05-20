# NXT21_GIZ4_SWD2_G1_Graduation_Project_Team2

A social media web application built with React, allowing users to create posts, add comments, and view profiles. This is the Graduation Project for Team 2 — DEPI (Digital Egypt Pioneers Initiative).

## Features

- User authentication (Sign up / Login) with JWT
- Protected & guest routes
- Create posts with images
- View news feed
- Add comments on posts
- Delete your own posts
- View your profile and other users' posts
- Responsive design with Tailwind CSS

## Tech Stack

- **React 19** + **Vite**
- **React Router DOM v7** — routing
- **TanStack Query** — data fetching & caching
- **Axios** — HTTP requests
- **React Hook Form** + **Zod** — form handling & validation
- **Tailwind CSS** + **Flowbite** + **HeroUI** — styling
- **React Hot Toast** — notifications
- **JWT Decode** — token handling

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
git clone https://github.com/ahmed-sayed37/NXT21_GIZ4_SWD2_G1_Graduation_Project_Team2.git
cd NXT21_GIZ4_SWD2_G1_Graduation_Project_Team2
npm install
```

### Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## API

This project uses the [Linked Posts API](https://linked-posts.routemisr.com/) provided by Route Academy for posts, comments, and user authentication.

## Project Structure

```
src/
├── Components/
│   ├── CommentCard/
│   ├── CreatePost/
│   ├── Footer/
│   ├── GuestRoute/
│   ├── Home/
│   ├── Layout/
│   ├── LoadingScreen/
│   ├── Login/
│   ├── Navbar/
│   ├── PostCard/
│   ├── PostDetails/
│   ├── Profile/
│   ├── ProtectedRoute/
│   ├── Register/
│   └── InputLabel.jsx
├── context/
│   ├── AuthContext.jsx
│   └── AuthContextStore.js
├── hooks/
│   └── useDocumentTitle.js
├── App.jsx
└── main.jsx
```
