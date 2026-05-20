import { useContext } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import PostCard from "../PostCard/PostCard";
import Loading from "../LoadingScreen/Loading";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { AuthContext } from "../../context/AuthContextStore";

export default function Profile() {
  useDocumentTitle("Profile");

  const { userId } = useContext(AuthContext);

  function getUserPosts() {
    return axios.get(
      `https://linked-posts.routemisr.com/users/${userId}/posts?limit=20`,
      {
        headers: {
          token: localStorage.getItem("tkn"),
        },
      }
    );
  }

  const { isLoading, isError, data } = useQuery({
    queryKey: ["getUserPosts", userId],
    queryFn: getUserPosts,
    enabled: !!userId,
  });

  if (isLoading || !userId) return <Loading />;

  if (isError) {
    return <h1 className="text-center text-2xl py-10">Failed to load your posts</h1>;
  }

  return (
    <div className="w-1/2 mx-auto">
      {data.data.posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
