import { useContext } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PersonCard from "../PersonCard/PersonCard";
import { AuthContext } from "../../context/AuthContextStore";
import { getSuggestions, listFriends, DEFAULT_PHOTO } from "../../api/mockApi";

export default function RightRail() {
  const { userId } = useContext(AuthContext);

  const { data: suggestions } = useQuery({
    queryKey: ["getSuggestions"],
    queryFn: () => getSuggestions(4),
    enabled: !!userId,
  });

  const { data: friendsData } = useQuery({
    queryKey: ["listFriends", userId],
    queryFn: () => listFriends(userId),
    enabled: !!userId,
  });

  const suggested = suggestions?.data?.suggestions || [];
  const friends = friendsData?.data?.friends || [];

  return (
    <aside className="hidden xl:block sticky top-4 self-start space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 w-72">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            People you may know
          </h3>
          <Link
            to="/people"
            className="text-xs text-violet-600 hover:underline"
          >
            See all
          </Link>
        </div>
        {suggested.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No suggestions yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {suggested.map((p) => (
              <li key={p._id}>
                <PersonCard person={p} compact />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 w-72">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Your friends
          </h3>
          <Link to="/friends" className="text-xs text-violet-600 hover:underline">
            See all
          </Link>
        </div>
        {friends.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No friends yet. Add someone from <Link to="/people" className="text-violet-600 underline">People</Link>.
          </p>
        ) : (
          <ul className="space-y-2">
            {friends.slice(0, 5).map((f) => (
              <li key={f._id}>
                <Link
                  to={`/profile/${f._id}`}
                  className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="relative">
                    <img
                      src={f.photo}
                      onError={(e) => (e.target.src = DEFAULT_PHOTO)}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-800" />
                  </div>
                  <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                    {f.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
