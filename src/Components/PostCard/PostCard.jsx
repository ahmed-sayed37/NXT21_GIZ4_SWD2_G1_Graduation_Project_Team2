import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import CommentCard from "../CommentCard/CommentCard";
import Loading from "../LoadingScreen/Loading";
import { AuthContext } from "../../context/AuthContextStore";

const STATIC_USER_IMAGE =
  "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg";

export default function PostCard({ post, isInSinglePage = false }) {
  const [comment, setComment] = useState("");

  const { userId } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const reversedComments = useMemo(
    () => structuredClone(post).comments.reverse(),
    [post]
  );

  const { mutate: deletePost } = useMutation({
    mutationFn: () =>
      axios.delete(`https://linked-posts.routemisr.com/posts/${post.id}`, {
        headers: { token: localStorage.getItem("tkn") },
      }),
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["getPosts"] });
      queryClient.invalidateQueries({ queryKey: ["getUserPosts"] });
    },
    onError: () => toast.error("Failed to delete post"),
  });

  const { mutate: addComment, isPending } = useMutation({
    mutationFn: () =>
      axios.post(
        "https://linked-posts.routemisr.com/comments",
        { content: comment, post: post.id },
        { headers: { token: localStorage.getItem("tkn") } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSinglePost", post.id] });
      queryClient.invalidateQueries({ queryKey: ["getPosts"] });
    },
    onSettled: () => setComment(""),
  });

  return (
    <div className="my-7">
      <div className="shadow-2xl bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 md:rounded-3xl p-4">
        <div className="bg-white h-auto p-8 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <img
                src={post.user.photo}
                onError={(e) => (e.target.src = STATIC_USER_IMAGE)}
                alt="User Avatar"
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-gray-800 font-semibold">{post.user.name}</p>
                <p className="text-gray-500 text-sm">Posted 2 hours ago</p>
              </div>
            </div>

            {post.user._id === userId && (
              <div className="text-gray-500 cursor-pointer">
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="bordered">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx={12} cy={7} r={1} />
                        <circle cx={12} cy={12} r={1} />
                        <circle cx={12} cy={17} r={1} />
                      </svg>
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    onAction={(key) => {
                      if (key === "delete") deletePost();
                    }}
                  >
                    <DropdownItem key="edit">Update</DropdownItem>
                    <DropdownItem key="delete" className="text-danger" color="danger">
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            )}
          </div>

          <div className="mb-4">
            <p className="text-gray-800">
              {post.body}
              <span className="text-blue-600"> #Omar_Khaled</span>
              <span className="text-blue-600"> #Route_Social_APP</span>
            </p>
          </div>

          <div className="mb-4">
            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="w-full object-cover object-center rounded-md"
              />
            )}
          </div>

          <div className="flex items-center justify-between text-gray-500">
            <button className="flex justify-center items-center gap-2 px-2 hover:bg-gray-50 rounded-full p-1">
              <svg
                className="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C6.11 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-4.11 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>42 Likes</span>
            </button>

            <button className="flex justify-center items-center gap-2 px-2 hover:bg-gray-50 rounded-full p-1">
              <svg
                width="22px"
                height="22px"
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22ZM8 13.25C7.58579 13.25 7.25 13.5858 7.25 14C7.25 14.4142 7.58579 14.75 8 14.75H13.5C13.9142 14.75 14.25 14.4142 14.25 14C14.25 13.5858 13.9142 13.25 13.5 13.25H8ZM7.25 10.5C7.25 10.0858 7.58579 9.75 8 9.75H16C16.4142 9.75 16.75 10.0858 16.75 10.5C16.75 10.9142 16.4142 11.25 16 11.25H8C7.58579 11.25 7.25 10.9142 7.25 10.5Z"
                />
              </svg>
              <span>{post.comments.length} Comment</span>
            </button>
          </div>

          <hr className="mt-2 mb-2" />
          <p className="text-gray-800 font-semibold">Comment</p>
          <hr className="mt-2 mb-2" />

          <div className="relative">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              type="text"
              className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Add Your Comment..."
            />
            <button
              onClick={() => addComment()}
              disabled={isPending || !comment.trim()}
              type="button"
              className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-60"
            >
              {isPending ? <Loading /> : "Comment"}
            </button>
          </div>

          <hr className="mt-2 mb-2" />

          <div className="mt-4">
            {!isInSinglePage && post.comments[0] && (
              <CommentCard comments={post.comments[0]} staticImage={STATIC_USER_IMAGE} />
            )}

            {!isInSinglePage && (
              <Link
                to={`/postDetails/${post.id}`}
                className="text-center cursor-pointer block font-bold text-blue-600"
              >
                View More comments...
              </Link>
            )}

            {isInSinglePage &&
              reversedComments.map((c) => (
                <CommentCard
                  key={c._id}
                  comments={c}
                  staticImage={STATIC_USER_IMAGE}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
