import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./Components/Layout/Layout";
import Loading from "./Components/LoadingScreen/Loading";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import GuestRoute from "./Components/GuestRoute/GuestRoute";
import ErrorBoundary from "./Components/ErrorBoundary/ErrorBoundary";
import AuthContextProvider from "./context/AuthContext";
import ThemeContextProvider from "./context/ThemeContext";

const Login = lazy(() => import("./Components/Login/Login"));
const Register = lazy(() => import("./Components/Register/Register"));
const Home = lazy(() => import("./Components/Home/Home"));
const Profile = lazy(() => import("./Components/Profile/Profile"));
const PostDetails = lazy(() => import("./Components/PostDetails/PostDetails"));
const Friends = lazy(() => import("./Components/Friends/Friends"));
const People = lazy(() => import("./Components/People/People"));
const Settings = lazy(() => import("./Components/Settings/Settings"));
const Chat = lazy(() => import("./Components/Chat/Chat"));

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

function withSuspense(node) {
  return <Suspense fallback={<Loading />}>{node}</Suspense>;
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <Navigate to="/home" replace /> },
        { path: "login", element: <GuestRoute>{withSuspense(<Login />)}</GuestRoute> },
        { path: "register", element: <GuestRoute>{withSuspense(<Register />)}</GuestRoute> },
        { path: "home", element: <ProtectedRoute>{withSuspense(<Home />)}</ProtectedRoute> },
        { path: "profile", element: <ProtectedRoute>{withSuspense(<Profile />)}</ProtectedRoute> },
        { path: "profile/:id", element: <ProtectedRoute>{withSuspense(<Profile />)}</ProtectedRoute> },
        { path: "postDetails/:id", element: <ProtectedRoute>{withSuspense(<PostDetails />)}</ProtectedRoute> },
        { path: "friends", element: <ProtectedRoute>{withSuspense(<Friends />)}</ProtectedRoute> },
        { path: "people", element: <ProtectedRoute>{withSuspense(<People />)}</ProtectedRoute> },
        { path: "settings", element: <ProtectedRoute>{withSuspense(<Settings />)}</ProtectedRoute> },
        { path: "chat", element: <ProtectedRoute>{withSuspense(<Chat />)}</ProtectedRoute> },
        { path: "chat/:id", element: <ProtectedRoute>{withSuspense(<Chat />)}</ProtectedRoute> },
        {
          path: "*",
          element: (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-10 text-center text-2xl">
              404 — Page Not Found
            </div>
          ),
        },
      ],
    },
  ],
  { basename }
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 30 * 1000 },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeContextProvider>
        <QueryClientProvider client={queryClient}>
          <AuthContextProvider>
            <RouterProvider router={router} />
          </AuthContextProvider>
        </QueryClientProvider>
      </ThemeContextProvider>
    </ErrorBoundary>
  );
}
