import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listIncomingRequests, getUnreadMessagesCount } from "../../api/mockApi";

const TABS = [
  {
    to: "/home",
    label: "Home",
    icon: (
      <path d="M3 12l9-9 9 9M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    to: "/people",
    label: "People",
    icon: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 19c1-3.5 4-5 6-5s5 1.5 6 5M14 16c.5-1.5 2-2.5 3-2.5s2.5 1 3 2.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    to: "/chat",
    label: "Chat",
    icon: (
      <path
        d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    badgeKey: "unread",
  },
  {
    to: "/friends",
    label: "Friends",
    icon: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M3 20c0-3.5 3-6 6-6s6 2.5 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    badgeKey: "incoming",
  },
  {
    to: "/profile",
    label: "Profile",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

export default function BottomNav() {
  const { data: incoming } = useQuery({
    queryKey: ["listIncoming"],
    queryFn: () => listIncomingRequests(),
  });
  const { data: unread } = useQuery({
    queryKey: ["getUnreadCount"],
    queryFn: () => getUnreadMessagesCount(),
    refetchInterval: 4000,
  });
  const badges = {
    incoming: incoming?.data?.requests?.length || 0,
    unread: unread?.data?.count || 0,
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {TABS.map((t) => (
          <li key={t.to}>
            <NavLink
              to={t.to}
              end={t.to === "/profile"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2 text-xs transition relative ${
                  isActive
                    ? "text-violet-600"
                    : "text-gray-500 dark:text-gray-300 hover:text-violet-600"
                }`
              }
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {t.icon}
              </svg>
              <span>{t.label}</span>
              {t.badgeKey && badges[t.badgeKey] > 0 && (
                <span className="absolute top-1 right-[22%] bg-rose-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                  {badges[t.badgeKey]}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
