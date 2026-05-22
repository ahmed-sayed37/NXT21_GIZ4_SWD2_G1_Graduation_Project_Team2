import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  deleteComment as apiDeleteComment,
  editComment as apiEditComment,
  DEFAULT_PHOTO,
} from "../../api/mockApi";
import { AuthContext } from "../../context/AuthContextStore";
import { relativeTime } from "../../lib/relativeTime";

export default function CommentCard({ comment, postId }) {
  const { userId } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  const isOwner = comment.commentCreator._id === userId;

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["getPosts"] });
    queryClient.invalidateQueries({ queryKey: ["getUserPosts"] });
    queryClient.invalidateQueries({ queryKey: ["getSinglePost", postId] });
  }

  const { mutate: removeComment } = useMutation({
    mutationFn: () => apiDeleteComment({ commentId: comment._id, postId }),
    onSuccess: () => {
      toast.success("Comment deleted");
      invalidateAll();
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to delete"),
  });

  const { mutate: saveEdit, isPending: isSaving } = useMutation({
    mutationFn: () =>
      apiEditComment({ commentId: comment._id, postId, content: draft }),
    onSuccess: () => {
      toast.success("Comment updated");
      setIsEditing(false);
      invalidateAll();
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to update"),
  });

  return (
    <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
      <Link to={`/profile/${comment.commentCreator._id}`} className="shrink-0">
        <img
          onError={(e) => (e.target.src = DEFAULT_PHOTO)}
          src={comment.commentCreator.photo}
          alt={comment.commentCreator.name}
          className="w-8 h-8 rounded-full object-cover"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <Link
            to={`/profile/${comment.commentCreator._id}`}
            className="text-gray-800 dark:text-gray-100 font-semibold hover:underline"
          >
            {comment.commentCreator.name}
          </Link>
          <time
            dateTime={comment.createdAt}
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            {relativeTime(comment.createdAt)}
          </time>
        </div>

        {isEditing ? (
          <div className="mt-1">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => saveEdit()}
                disabled={isSaving || !draft.trim() || draft === comment.content}
                className="px-3 py-1 text-xs rounded bg-violet-600 text-white disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(comment.content);
                  setIsEditing(false);
                }}
                className="px-3 py-1 text-xs rounded border border-gray-300 dark:border-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-200 text-sm break-words">
            {comment.content}
          </p>
        )}

        {isOwner && !isEditing && (
          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-xs text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Delete this comment?")) removeComment();
              }}
              className="text-xs text-rose-600 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
