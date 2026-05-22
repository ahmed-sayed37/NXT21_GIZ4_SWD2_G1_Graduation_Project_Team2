import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import FriendButton from "../FriendButton/FriendButton";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import {
  listFriends,
  listIncomingRequests,
  listOutgoingRequests,
  FRIEND_STATUS,
  DEFAULT_PHOTO,
} from "../../api/mockApi";

const TABS = [
  { id: "friends", label: "Friends" },
  { id: "incoming", label: "Requests" },
  { id: "outgoing", label: "Sent" },
];

export default function Friends() {
  useDocumentTitle("Friends");
  const [tab, setTab] = useState("friends");

  const friendsQuery = useQuery({
    queryKey: ["listFriends"],
    queryFn: () => listFriends(),
  });
  const incomingQuery = useQuery({
    queryKey: ["listIncoming"],
    queryFn: () => listIncomingRequests(),
  });
  const outgoingQuery = useQuery({
    queryKey: ["listOutgoing"],
    queryFn: () => listOutgoingRequests(),
  });

  const counts = {
    friends: friendsQuery.data?.data?.friends?.length || 0,
    incoming: incomingQuery.data?.data?.requests?.length || 0,
    outgoing: outgoingQuery.data?.data?.requests?.length || 0,
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
        <h1 className="text-2xl font-bold mb-3">Friends</h1>
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                tab === t.id
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:text-violet-600"
              }`}
            >
              {t.label}
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                {counts[t.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {tab === "friends" && (
        <FriendsList query={friendsQuery} />
      )}
      {tab === "incoming" && (
        <RequestList
          query={incomingQuery}
          mode="incoming"
          empty="No incoming requests."
        />
      )}
      {tab === "outgoing" && (
        <RequestList
          query={outgoingQuery}
          mode="outgoing"
          empty="You haven't sent any requests."
        />
      )}
    </div>
  );
}

function FriendsList({ query }) {
  if (query.isLoading) return <Card>Loading…</Card>;
  const friends = query.data?.data?.friends || [];
  if (friends.length === 0)
    return (
      <Card>
        No friends yet.{" "}
        <Link to="/people" className="text-violet-600 underline">
          Find people
        </Link>{" "}
        to add.
      </Card>
    );

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {friends.map((f) => (
        <div
          key={f._id}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow p-3 flex items-center gap-3"
        >
          <Link to={`/profile/${f._id}`} className="shrink-0">
            <img
              src={f.photo}
              onError={(e) => (e.target.src = DEFAULT_PHOTO)}
              alt=""
              className="w-14 h-14 rounded-full object-cover ring-2 ring-violet-500"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              to={`/profile/${f._id}`}
              className="font-semibold text-gray-900 dark:text-white hover:underline truncate block"
            >
              {f.name}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              📍 {f.location || "—"}
            </p>
          </div>
          <FriendButton userId={f._id} status={FRIEND_STATUS.FRIENDS} />
        </div>
      ))}
    </div>
  );
}

function RequestList({ query, mode, empty }) {
  if (query.isLoading) return <Card>Loading…</Card>;
  const requests = query.data?.data?.requests || [];
  if (requests.length === 0) return <Card>{empty}</Card>;

  return (
    <div className="space-y-3">
      {requests.map((r) => {
        const user = mode === "incoming" ? r.fromUser : r.toUser;
        const status =
          mode === "incoming"
            ? FRIEND_STATUS.REQUEST_RECEIVED
            : FRIEND_STATUS.REQUEST_SENT;
        return (
          <div
            key={r.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow p-3 flex items-center gap-3"
          >
            <Link to={`/profile/${user._id}`} className="shrink-0">
              <img
                src={user.photo}
                onError={(e) => (e.target.src = DEFAULT_PHOTO)}
                alt=""
                className="w-14 h-14 rounded-full object-cover"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                to={`/profile/${user._id}`}
                className="font-semibold text-gray-900 dark:text-white hover:underline block truncate"
              >
                {user.name}
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                📍 {user.location || "—"}
              </p>
            </div>
            <FriendButton userId={user._id} status={status} />
          </div>
        );
      })}
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center text-gray-600 dark:text-gray-300">
      {children}
    </div>
  );
}
