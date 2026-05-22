import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../context/AuthContextStore";
import { ThemeContext } from "../../context/ThemeContextStore";
import { DEFAULT_PHOTO } from "../../api/mockApi";

export default function Navbar() {
  const { token, user, clearUserToken } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  function handleLogout() {
    clearUserToken();
    queryClient.clear();
    navigate("/login");
  }

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/home?q=${encodeURIComponent(q)}` : "/home");
    setIsOpen(false);
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-3 gap-3">
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Social Connect home">
          <span
            className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md"
            aria-hidden="true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="8" r="3" />
              <circle cx="17" cy="8" r="3" />
              <circle cx="12" cy="17" r="3" />
              <path d="M9.5 9.5l2.5 4.5M14.5 9.5L12 14M10 8h4" />
            </svg>
          </span>
          <span className="text-xl sm:text-2xl font-bold whitespace-nowrap bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Social Connect
          </span>
        </Link>

        {token && (
          <form onSubmit={handleSearch} className="order-3 md:order-2 flex-1 md:max-w-md w-full md:w-auto">
            <div className="relative">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts or users..."
                className="w-full pl-9 pr-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 dark:text-white border border-transparent focus:border-violet-500 focus:bg-white dark:focus:bg-gray-700 outline-none text-sm"
                aria-label="Search"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
            </div>
          </form>
        )}

        <div className="flex items-center gap-2 order-2 md:order-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
          >
            {theme === "dark" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="5" />
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen((p) => !p)}
            aria-expanded={isOpen}
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-5 h-5" viewBox="0 0 17 14" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M1 1h15M1 7h15M1 13h15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={`${isOpen ? "block" : "hidden"} w-full md:block md:w-auto order-4`}>
          <ul className="font-medium flex flex-col md:flex-row md:items-center md:gap-6 p-2 md:p-0 mt-3 md:mt-0">
            {token ? (
              <>
                <li className="md:hidden">
                  <Link
                    to="/people"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 px-2 text-gray-700 dark:text-gray-200 hover:text-violet-600"
                  >
                    People
                  </Link>
                </li>
                <li className="md:hidden">
                  <Link
                    to="/friends"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 px-2 text-gray-700 dark:text-gray-200 hover:text-violet-600"
                  >
                    Friends
                  </Link>
                </li>
                <li className="md:hidden">
                  <Link
                    to="/chat"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 px-2 text-gray-700 dark:text-gray-200 hover:text-violet-600"
                  >
                    Chat
                  </Link>
                </li>
                <li className="md:hidden">
                  <Link
                    to="/settings"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 px-2 text-gray-700 dark:text-gray-200 hover:text-violet-600"
                  >
                    Settings
                  </Link>
                </li>
                <li>
                  <Link
                    to="/home"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 px-2 text-gray-700 dark:text-gray-200 hover:text-violet-600"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 py-2 px-2 text-gray-700 dark:text-gray-200 hover:text-violet-600"
                  >
                    <img
                      src={user?.photo || DEFAULT_PHOTO}
                      onError={(e) => (e.target.src = DEFAULT_PHOTO)}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="hidden lg:inline">{user?.name || "Profile"}</span>
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full text-left py-2 px-2 text-rose-600 hover:text-rose-700"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 px-2 text-gray-700 dark:text-gray-200 hover:text-violet-600"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 px-2 text-gray-700 dark:text-gray-200 hover:text-violet-600"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
