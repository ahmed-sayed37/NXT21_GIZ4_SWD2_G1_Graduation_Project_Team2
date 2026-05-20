import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

export default function Layout() {
  return (
    <>
      <Navbar />
      <div className="md:p-19 min-h-screen dark:text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
