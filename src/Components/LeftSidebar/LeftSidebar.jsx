import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listIncomingRequests, getUnreadMessagesCount } from "../../api/mockApi";

const links = [
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
    to: "/friends",
    label: "Friends",
    icon: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M3 20c0-3.5 3-6 6-6s6 2.5 6 6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 5l3 3M20 5l-3 3" strokeLinecap="round" />
      </>
    ),
    badgeKey: "incoming",
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
    to: "/profile",
    label: "Profile",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    to: "/settings",
    label: "Settings",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path
          d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 005.6 15a1.65 1.65 0 00-1.51-1H4a2 2 0 110-4h.09A1.65 1.65 0 005.6 9 1.65 1.65 0 005.27 7.18l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009.91 5h.09a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09A1.65 1.65 0 0016 4.6a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0020.4 9c.16.39.49.7.91.91h.09a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
];

export default function LeftSidebar() {
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
    <aside className="hidden lg:block sticky top-4 self-start">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 w-60">
        <nav className="space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/profile"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                  isActive
                    ? "bg-violet-600 text-white"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                {l.icon}
              </svg>
              <span className="text-sm font-medium flex-1">{l.label}</span>
              {l.badgeKey && badges[l.badgeKey] > 0 && (
                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {badges[l.badgeKey]}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
