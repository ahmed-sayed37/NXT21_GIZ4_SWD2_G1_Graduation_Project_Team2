import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import PostCard from "../PostCard/PostCard";
import Loading from "../LoadingScreen/Loading";
import CreatePost from "../CreatePost/CreatePost";
import useDocumentTitle from "../../hooks/useDocumentTitle";

function getAllPosts() {
  return axios.get("https://linked-posts.routemisr.com/posts?limit=20", {
    headers: {
      token: localStorage.getItem("tkn"),
    },
  });
}

export default function Home() {
  useDocumentTitle("News Feed");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["getPosts"],
    queryFn: getAllPosts,
  });

  if (isLoading) return <Loading />;

  if (isError) {
    return <h1 className="text-center text-2xl py-10">Something went wrong, please try again</h1>;
  }

  return (
    <div>
      <CreatePost />
      {data.data.posts.map((post) => (
        <PostCard key={post.id} post={post} isInSinglePage={false} />
      ))}
    </div>
  );
}
