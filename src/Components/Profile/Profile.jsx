import { useContext, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PostCard from "../PostCard/PostCard";
import PostSkeleton from "../Skeleton/PostSkeleton";
import EditProfileModal from "./EditProfileModal";
import FriendButton from "../FriendButton/FriendButton";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { getUserById, getUserPosts, listFriends, DEFAULT_PHOTO } from "../../api/mockApi";
import { AuthContext } from "../../context/AuthContextStore";

export default function Profile() {
  const { id } = useParams();
  const { userId } = useContext(AuthContext);
  const profileId = id || userId;

  const [isEditOpen, setIsEditOpen] = useState(false);

  const isMe = profileId === userId;
  useDocumentTitle(isMe ? "Your Profile" : "Profile");

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["getUser", profileId],
    queryFn: () => getUserById(profileId),
    enabled: !!profileId,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["getUserPosts", profileId],
    queryFn: () => getUserPosts(profileId, 50),
    enabled: !!profileId,
  });

  const { data: friendsData } = useQuery({
    queryKey: ["listFriends", profileId],
    queryFn: () => listFriends(profileId),
    enabled: !!profileId,
  });

  if (userLoading || !profileId) {
    return <PostSkeleton />;
  }

  const profileUser = userData?.data?.user;
  const friendStatus = userData?.data?.friendStatus;
  const mutualFriends = userData?.data?.mutualFriends || 0;
  if (!profileUser) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 text-center">
        User not found
      </div>
    );
  }

  const posts = postsData?.data?.posts || [];
  const friends = friendsData?.data?.friends || [];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 dark:text-white rounded-2xl shadow-xl overflow-hidden">
        <div className="h-36 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="px-6 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <img
              src={profileUser.photo}
              onError={(e) => (e.target.src = DEFAULT_PHOTO)}
              alt={profileUser.name}
              className="w-28 h-28 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 bg-gray-100"
            />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                {profileUser.bio && (
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{profileUser.bio}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {profileUser.location && (
                    <span>📍 {profileUser.location}</span>
                  )}
                  {profileUser.gender && (
                    <span className="capitalize">⚧ {profileUser.gender}</span>
                  )}
                  {isMe && profileUser.email && <span>✉ {profileUser.email}</span>}
                  <span>📝 {posts.length} {posts.length === 1 ? "post" : "posts"}</span>
                  <span>👥 {friends.length} friends</span>
                  {!isMe && mutualFriends > 0 && (
                    <span className="text-violet-600 dark:text-violet-300">
                      {mutualFriends} mutual
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {isMe ? (
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700"
                  >
                    Edit profile
                  </button>
                ) : (
                  <>
                    <FriendButton userId={profileUser._id} status={friendStatus} />
                    <Link
                      to={`/chat/${profileUser._id}`}
                      className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      💬 Message
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {postsLoading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-10 text-center">
          <h2 className="text-xl font-semibold mb-1">No posts yet</h2>
          {isMe && (
            <p className="text-gray-500 dark:text-gray-400">
              Head to Home and share your first post.
            </p>
          )}
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}

      {isMe && (
        <EditProfileModal
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          user={profileUser}
        />
      )}
    </div>
  );
}
