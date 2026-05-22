import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PostCard from "../PostCard/PostCard";
import PostSkeleton from "../Skeleton/PostSkeleton";
import CreatePost from "../CreatePost/CreatePost";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { getPosts, searchUsers, DEFAULT_PHOTO } from "../../api/mockApi";

export default function Home() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  useDocumentTitle(q ? `Search · ${q}` : "News Feed");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getPosts", q],
    queryFn: () => getPosts({ q }),
  });

  const { data: usersData } = useQuery({
    queryKey: ["searchUsers", q],
    queryFn: () => searchUsers(q),
    enabled: !!q,
  });

  const posts = data?.data?.posts || [];
  const users = usersData?.data?.users || [];

  return (
    <div>
      {!q && <CreatePost />}

      {q && (
        <div className="bg-white dark:bg-gray-800 dark:text-white p-4 rounded-2xl mb-4 shadow-lg">
          <h2 className="font-semibold mb-3">Results for "{q}"</h2>
          {users.length > 0 ? (
            <ul className="grid sm:grid-cols-2 gap-2">
              {users.map((u) => (
                <li key={u._id}>
                  <Link
                    to={`/profile/${u._id}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <img
                      src={u.photo}
                      onError={(e) => (e.target.src = DEFAULT_PHOTO)}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{u.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {u.location || ""}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No users found.</p>
          )}
        </div>
      )}

      {isLoading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : isError ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 text-center">
          {error?.message || "Something went wrong, please try again"}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-10 text-center">
          <h2 className="text-xl font-semibold mb-1">
            {q ? `No posts match "${q}"` : "No posts yet"}
          </h2>
          {!q && (
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to share something!
            </p>
          )}
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} isInSinglePage={false} />)
      )}
    </div>
  );
}
