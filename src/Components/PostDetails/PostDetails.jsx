import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PostCard from "../PostCard/PostCard";
import Loading from "../LoadingScreen/Loading";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { getPost } from "../../api/mockApi";

export default function PostDetails() {
  useDocumentTitle("Post Details");
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["getSinglePost", id],
    queryFn: () => getPost(id),
  });

  if (isLoading) return <Loading />;
  if (isError) return <h1 className="text-center text-2xl py-10">Post not found</h1>;

  return <PostCard post={data.data.post} isInSinglePage={true} />;
}
