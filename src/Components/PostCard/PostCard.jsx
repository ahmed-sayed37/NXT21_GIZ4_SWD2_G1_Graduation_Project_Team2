import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import Modal from "../Modal/Modal";
import {
  deletePost as apiDeletePost,
  addComment as apiAddComment,
  editPost as apiEditPost,
  toggleLike as apiToggleLike,
  DEFAULT_PHOTO,
} from "../../api/mockApi";
import { AuthContext } from "../../context/AuthContextStore";
import { relativeTime } from "../../lib/relativeTime";

export default function PostCard({ post, isInSinglePage = false }) {
  const [comment, setComment] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editBody, setEditBody] = useState(post.body);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const { userId } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const isOwner = post.user._id === userId;
  const liked = post.likes?.includes(userId);

  const reversedComments = useMemo(
    () => [...post.comments].reverse(),
    [post.comments]
  );

  const postUrl = `${window.location.origin}${import.meta.env.BASE_URL}postDetails/${post.id}`;

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["getPosts"] });
    queryClient.invalidateQueries({ queryKey: ["getUserPosts"] });
    queryClient.invalidateQueries({ queryKey: ["getSinglePost", post.id] });
  }

  const { mutate: deletePost } = useMutation({
    mutationFn: () => apiDeletePost(post.id),
    onSuccess: () => {
      toast.success("Post deleted");
      invalidateAll();
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to delete post"),
  });

  const { mutate: editPost, isPending: isSavingEdit } = useMutation({
    mutationFn: () => apiEditPost({ id: post.id, body: editBody }),
    onSuccess: () => {
      toast.success("Post updated");
      setIsEditOpen(false);
      invalidateAll();
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to update post"),
  });

  const { mutate: toggleLike, isPending: isLiking } = useMutation({
    mutationFn: () => apiToggleLike(post.id),
    onSuccess: () => invalidateAll(),
    onError: (err) => toast.error(err.response?.data?.error || "Failed to like"),
  });

  const { mutate: addComment, isPending: isAddingComment } = useMutation({
    mutationFn: () => apiAddComment({ content: comment, postId: post.id }),
    onSuccess: () => invalidateAll(),
    onSettled: () => setComment(""),
    onError: (err) => toast.error(err.response?.data?.error || "Failed to comment"),
  });

  async function handleShare() {
    const shareData = {
      title: `${post.user.name} on Social Connect`,
      text: post.body.slice(0, 140),
      url: postUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled — fall through to modal
      }
    }
    setIsShareOpen(true);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success("Link copied");
      setIsShareOpen(false);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <article className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-2xl shadow-lg mb-4 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Link
            to={`/profile/${post.user._id}`}
            className="flex items-center gap-3 hover:opacity-80"
          >
            <img
              src={post.user.photo}
              onError={(e) => (e.target.src = DEFAULT_PHOTO)}
              alt={post.user.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-violet-500/40"
            />
            <div>
              <p className="font-semibold">{post.user.name}</p>
              <time
                dateTime={post.createdAt}
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                {relativeTime(post.createdAt)}
              </time>
            </div>
          </Link>

          {isOwner && (
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" aria-label="Post actions" isIconOnly>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
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
                aria-label="Post actions"
                onAction={(key) => {
                  if (key === "edit") {
                    setEditBody(post.body);
                    setIsEditOpen(true);
                  } else if (key === "delete") {
                    if (window.confirm("Delete this post?")) deletePost();
                  }
                }}
              >
                <DropdownItem key="edit">Update</DropdownItem>
                <DropdownItem key="delete" className="text-danger" color="danger">
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </div>

        {post.body && (
          <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words mb-3">
            {post.body}
          </p>
        )}
      </div>

      {post.image && (
        <Link to={`/postDetails/${post.id}`} className="block bg-black">
          <img
            src={post.image}
            alt="Post"
            className="w-full max-h-[640px] object-cover"
          />
        </Link>
      )}

      <div className="px-5 py-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>
          {post.likes?.length || 0} {(post.likes?.length || 0) === 1 ? "like" : "likes"}
        </span>
        <span>
          {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      <div className="px-2 py-1 grid grid-cols-3 gap-1">
        <ActionButton
          active={liked}
          onClick={() => toggleLike()}
          disabled={isLiking}
          ariaLabel={liked ? "Unlike post" : "Like post"}
          activeColor="text-rose-600"
          label={liked ? "Liked" : "Like"}
          icon={
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          }
        />
        <Link
          to={`/postDetails/${post.id}`}
          className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-medium">Comment</span>
        </Link>
        <ActionButton
          onClick={handleShare}
          ariaLabel="Share post"
          label="Share"
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" strokeLinecap="round" />
            </svg>
          }
        />
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      <div className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (comment.trim()) addComment();
          }}
          className="relative mb-3"
        >
          <label htmlFor={`comment-${post.id}`} className="sr-only">
            Add a comment
          </label>
          <input
            id={`comment-${post.id}`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            type="text"
            className="block w-full p-3 pe-24 text-sm border border-gray-200 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Write a comment…"
          />
          <button
            type="submit"
            disabled={isAddingComment || !comment.trim()}
            className="absolute end-2 top-1/2 -translate-y-1/2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-full text-sm px-4 py-1.5 disabled:opacity-50"
          >
            {isAddingComment ? "…" : "Post"}
          </button>
        </form>

        <div className="space-y-3">
          {!isInSinglePage && post.comments[post.comments.length - 1] && (
            <CommentCard
              comment={post.comments[post.comments.length - 1]}
              postId={post.id}
            />
          )}

          {!isInSinglePage && post.comments.length > 1 && (
            <Link
              to={`/postDetails/${post.id}`}
              className="text-center block font-medium text-violet-600 hover:underline text-sm"
            >
              View {post.comments.length - 1} more comment
              {post.comments.length - 1 === 1 ? "" : "s"}
            </Link>
          )}

          {isInSinglePage &&
            reversedComments.map((c) => (
              <CommentCard key={c._id} comment={c} postId={post.id} />
            ))}
        </div>
      </div>

      <Modal open={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit post">
        <textarea
          value={editBody}
          onChange={(e) => setEditBody(e.target.value)}
          maxLength={500}
          rows={5}
          className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <div className="flex justify-end gap-2 mt-3">
          <button
            type="button"
            onClick={() => setIsEditOpen(false)}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => editPost()}
            disabled={isSavingEdit || !editBody.trim()}
            className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {isSavingEdit ? "Saving..." : "Save"}
          </button>
        </div>
      </Modal>

      <Modal open={isShareOpen} onClose={() => setIsShareOpen(false)} title="Share post">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Share this link:
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={postUrl}
            onClick={(e) => e.target.select()}
            className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 text-sm"
          />
          <button
            type="button"
            onClick={copyLink}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700"
          >
            Copy
          </button>
        </div>
      </Modal>
    </article>
  );
}

function ActionButton({ onClick, disabled, ariaLabel, label, icon, active, activeColor }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`flex items-center justify-center gap-2 py-2 rounded-lg transition disabled:opacity-50 ${
        active
          ? `${activeColor} bg-rose-50 dark:bg-rose-950/30`
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
