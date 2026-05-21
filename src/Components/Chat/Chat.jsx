import { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import {
  listConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  DEFAULT_PHOTO,
} from "../../api/mockApi";
import { AuthContext } from "../../context/AuthContextStore";
import { relativeTime } from "../../lib/relativeTime";

export default function Chat() {
  const { id: otherId } = useParams();
  useDocumentTitle(otherId ? "Conversation" : "Chat");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden h-[calc(100vh-9rem)] min-h-[28rem] flex">
      <ConversationList activeId={otherId} />
      <Thread otherId={otherId} />
    </div>
  );
}

function ConversationList({ activeId }) {
  const { data, isLoading } = useQuery({
    queryKey: ["listConversations"],
    queryFn: () => listConversations(),
    refetchInterval: 3000,
  });
  const conversations = data?.data?.conversations || [];

  return (
    <aside
      className={`w-full md:w-72 border-r border-gray-200 dark:border-gray-700 flex-col ${
        activeId ? "hidden md:flex" : "flex"
      }`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold">Chats</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="p-4 text-sm text-gray-500">Loading…</p>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No conversations yet.{" "}
            <Link to="/people" className="text-violet-600 underline">
              Find people
            </Link>{" "}
            and start a chat.
          </div>
        ) : (
          <ul>
            {conversations.map((c) => (
              <li key={c.otherId}>
                <Link
                  to={`/chat/${c.otherId}`}
                  className={`flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 ${
                    activeId === c.otherId ? "bg-violet-50 dark:bg-violet-950/40" : ""
                  }`}
                >
                  <img
                    src={c.other.photo}
                    onError={(e) => (e.target.src = DEFAULT_PHOTO)}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm truncate">{c.other.name}</p>
                      <time className="text-[10px] text-gray-500 dark:text-gray-400 shrink-0">
                        {relativeTime(c.lastMessage.createdAt)}
                      </time>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {c.lastMessage.content}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] rounded-full px-1.5 py-0.5 shrink-0">
                      {c.unread}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function Thread({ otherId }) {
  const { userId } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ["getMessages", otherId],
    queryFn: () => getMessages(otherId),
    enabled: !!otherId,
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (!otherId) return;
    markConversationRead(otherId).then(() => {
      queryClient.invalidateQueries({ queryKey: ["listConversations"] });
      queryClient.invalidateQueries({ queryKey: ["getUnreadCount"] });
    });
  }, [otherId, queryClient, data?.data?.messages?.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data?.data?.messages?.length]);

  const { mutate: send, isPending } = useMutation({
    mutationFn: () => sendMessage({ to: otherId, content: draft }),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["getMessages", otherId] });
      queryClient.invalidateQueries({ queryKey: ["listConversations"] });
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to send"),
  });

  if (!otherId) {
    return (
      <div className="hidden md:flex flex-1 items-center justify-center text-gray-500 dark:text-gray-400 p-6 text-center">
        <div>
          <p className="text-lg font-semibold mb-1">Pick a conversation</p>
          <p className="text-sm">Or start a new one from anyone's profile.</p>
        </div>
      </div>
    );
  }

  const messages = data?.data?.messages || [];
  const other = data?.data?.other;

  return (
    <section className="flex-1 flex flex-col min-w-0">
      <header className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-700">
        <Link
          to="/chat"
          aria-label="Back to chats"
          className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        {other && (
          <Link to={`/profile/${other._id}`} className="flex items-center gap-3 min-w-0">
            <img
              src={other.photo}
              onError={(e) => (e.target.src = DEFAULT_PHOTO)}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="font-semibold truncate">{other.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {other.location || ""}
              </p>
            </div>
          </Link>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-900">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">
            No messages yet. Say hi 👋
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.from === userId;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-[70%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words shadow ${
                    mine
                      ? "bg-violet-600 text-white rounded-br-sm"
                      : "bg-white dark:bg-gray-800 dark:text-gray-100 rounded-bl-sm"
                  }`}
                >
                  <p>{m.content}</p>
                  <p
                    className={`text-[10px] mt-1 text-right ${
                      mine ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {relativeTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) send();
        }}
        className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          type="submit"
          disabled={isPending || !draft.trim()}
          className="px-4 py-2 rounded-full bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
          aria-label="Send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </section>
  );
}
