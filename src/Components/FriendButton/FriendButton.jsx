import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  sendFriendRequest,
  cancelFriendRequest,
  respondToRequest,
  removeFriend,
  FRIEND_STATUS,
} from "../../api/mockApi";

export default function FriendButton({ userId, status, className = "" }) {
  const queryClient = useQueryClient();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["getUser"] });
    queryClient.invalidateQueries({ queryKey: ["listPeople"] });
    queryClient.invalidateQueries({ queryKey: ["listFriends"] });
    queryClient.invalidateQueries({ queryKey: ["listIncoming"] });
    queryClient.invalidateQueries({ queryKey: ["listOutgoing"] });
    queryClient.invalidateQueries({ queryKey: ["getSuggestions"] });
  }

  const { mutate: send, isPending: sending } = useMutation({
    mutationFn: () => sendFriendRequest(userId),
    onSuccess: (r) => {
      toast.success(r.data.friended ? "Now friends" : "Friend request sent");
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed"),
  });

  const { mutate: cancel, isPending: canceling } = useMutation({
    mutationFn: () => cancelFriendRequest(userId),
    onSuccess: () => {
      toast.success("Request cancelled");
      invalidate();
    },
  });

  const { mutate: accept, isPending: accepting } = useMutation({
    mutationFn: () => respondToRequest({ fromUserId: userId, accept: true }),
    onSuccess: () => {
      toast.success("Friend added");
      invalidate();
    },
  });

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: () => respondToRequest({ fromUserId: userId, accept: false }),
    onSuccess: () => {
      toast.success("Request rejected");
      invalidate();
    },
  });

  const { mutate: unfriend, isPending: removing } = useMutation({
    mutationFn: () => removeFriend(userId),
    onSuccess: () => {
      toast.success("Friend removed");
      invalidate();
    },
  });

  if (status === FRIEND_STATUS.SELF) return null;

  const base =
    "px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50";

  if (status === FRIEND_STATUS.FRIENDS) {
    return (
      <button
        type="button"
        onClick={() => window.confirm("Remove friend?") && unfriend()}
        disabled={removing}
        className={`${base} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-900/40 dark:hover:text-rose-300 ${className}`}
      >
        ✓ Friends
      </button>
    );
  }

  if (status === FRIEND_STATUS.REQUEST_SENT) {
    return (
      <button
        type="button"
        onClick={() => cancel()}
        disabled={canceling}
        className={`${base} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 ${className}`}
      >
        Cancel request
      </button>
    );
  }

  if (status === FRIEND_STATUS.REQUEST_RECEIVED) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <button
          type="button"
          onClick={() => accept()}
          disabled={accepting}
          className={`${base} bg-violet-600 text-white hover:bg-violet-700`}
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => reject()}
          disabled={rejecting}
          className={`${base} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600`}
        >
          Reject
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => send()}
      disabled={sending}
      className={`${base} bg-violet-600 text-white hover:bg-violet-700 ${className}`}
    >
      + Add friend
    </button>
  );
}
