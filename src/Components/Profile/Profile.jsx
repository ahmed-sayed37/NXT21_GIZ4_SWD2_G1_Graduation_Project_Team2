import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import PostCard from "../PostCard/PostCard";
import Loading from "../LoadingScreen/Loading";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { getUserPosts } from "../../api/mockApi";
import { AuthContext } from "../../context/AuthContextStore";

export default function Profile() {
  useDocumentTitle("Profile");

  const { userId } = useContext(AuthContext);

  const { isLoading, isError, data } = useQuery({
    queryKey: ["getUserPosts", userId],
    queryFn: () => getUserPosts(userId, 20),
    enabled: !!userId,
  });

  if (isLoading || !userId) return <Loading />;

  if (isError) {
    return <h1 className="text-center text-2xl py-10">Failed to load your posts</h1>;
  }

  if (data.data.posts.length === 0) {
    return (
      <div className="text-center py-20 text-white">
        <h2 className="text-3xl mb-2">No posts yet</h2>
        <p>Go to the home page and create your first post!</p>
      </div>
    );
  }

  return (
    <div className="w-1/2 mx-auto">
      {data.data.posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
