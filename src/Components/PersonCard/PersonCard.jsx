import { Link } from "react-router-dom";
import FriendButton from "../FriendButton/FriendButton";
import { DEFAULT_PHOTO, FRIEND_STATUS } from "../../api/mockApi";

export default function PersonCard({ person, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2">
        <Link
          to={`/profile/${person._id}`}
          className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-80"
        >
          <img
            src={person.photo}
            onError={(e) => (e.target.src = DEFAULT_PHOTO)}
            alt=""
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="font-medium text-gray-800 dark:text-gray-100 truncate text-sm">
              {person.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {person.mutualFriends > 0
                ? `${person.mutualFriends} mutual`
                : person.location || ""}
            </p>
          </div>
        </Link>
        <FriendButton userId={person._id} status={person.friendStatus} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition p-4 flex flex-col items-center text-center">
      <Link to={`/profile/${person._id}`} className="block">
        <img
          src={person.photo}
          onError={(e) => (e.target.src = DEFAULT_PHOTO)}
          alt=""
          className="w-20 h-20 rounded-full object-cover ring-2 ring-violet-500 mb-3"
        />
      </Link>
      <Link
        to={`/profile/${person._id}`}
        className="font-semibold text-gray-900 dark:text-white hover:underline"
      >
        {person.name}
      </Link>
      {person.location && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          📍 {person.location}
        </p>
      )}
      {person.bio && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
          {person.bio}
        </p>
      )}
      {person.mutualFriends > 0 && (
        <p className="text-xs text-violet-600 dark:text-violet-300 mt-2">
          {person.mutualFriends} mutual friend
          {person.mutualFriends === 1 ? "" : "s"}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        <FriendButton userId={person._id} status={person.friendStatus} />
        {person.friendStatus !== FRIEND_STATUS.SELF && (
          <Link
            to={`/chat/${person._id}`}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            💬 Message
          </Link>
        )}
      </div>
    </div>
  );
}
