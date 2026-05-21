import { useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import LeftSidebar from "../LeftSidebar/LeftSidebar";
import RightRail from "../RightRail/RightRail";
import BottomNav from "../BottomNav/BottomNav";
import { AuthContext } from "../../context/AuthContextStore";

const FULLSCREEN_ROUTES = new Set(["/login", "/register"]);

export default function Layout() {
  const { token } = useContext(AuthContext);
  const { pathname } = useLocation();
  const isAuthPage = FULLSCREEN_ROUTES.has(pathname);
  const showShell = !!token && !isAuthPage;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Toaster position="top-right" />
      <Navbar />

      <main
        className={`max-w-7xl mx-auto px-3 md:px-6 py-4 ${
          showShell ? "pb-20 lg:pb-4" : ""
        }`}
      >
        {showShell ? (
          <div className="grid grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_18rem] gap-4">
            <LeftSidebar />
            <section className="min-w-0">
              <Outlet />
            </section>
            <RightRail />
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      {showShell && <BottomNav />}
      <Footer />
    </div>
  );
}
