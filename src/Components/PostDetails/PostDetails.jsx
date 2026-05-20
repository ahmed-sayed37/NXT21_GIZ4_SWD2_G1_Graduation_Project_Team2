import axios from "axios";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PostCard from "../PostCard/PostCard";
import Loading from "../LoadingScreen/Loading";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function PostDetails() {
  useDocumentTitle("Post Details");
  const { id } = useParams();

  function getPostDetails() {
    return axios.get(`https://linked-posts.routemisr.com/posts/${id}`, {
      headers: {
        token: localStorage.getItem("tkn"),
      },
    });
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["getSinglePost", id],
    queryFn: getPostDetails,
  });

  if (isLoading) return <Loading />;
  if (isError) return <h1 className="text-center text-2xl py-10">Post not found</h1>;

  return <PostCard post={data.data.post} isInSinglePage={true} />;
}
