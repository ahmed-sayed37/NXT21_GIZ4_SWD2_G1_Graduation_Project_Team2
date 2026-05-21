import { useContext, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import toast from "react-hot-toast";
import { createPost, DEFAULT_PHOTO } from "../../api/mockApi";
import { AuthContext } from "../../context/AuthContextStore";

const MAX_BODY = 300;

const schema = zod.object({
  body: zod.string().max(MAX_BODY, `Max ${MAX_BODY} characters`),
});

export default function CreatePost() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { body: "" },
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const bodyValue = watch("body");
  const hasImage = !!imageFile;
  const canSubmit = (bodyValue?.trim().length > 0) || hasImage;

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const { isPending, mutate } = useMutation({
    mutationFn: (data) => createPost({ body: data.body, imageFile }),
    onSuccess: () => {
      toast.success("Post created");
      reset();
      setImageFile(null);
      queryClient.invalidateQueries({ queryKey: ["getPosts"] });
      queryClient.invalidateQueries({ queryKey: ["getUserPosts"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Failed to create post");
    },
  });

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) setImageFile(file);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
  }

  return (
    <form
      onSubmit={handleSubmit(mutate)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-2xl shadow-lg p-4 mb-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <img
          src={user?.photo || DEFAULT_PHOTO}
          alt=""
          onError={(e) => (e.target.src = DEFAULT_PHOTO)}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/40"
        />
        <span className="font-semibold">{user?.name || "You"}</span>
      </div>

      <label htmlFor="post-body" className="sr-only">
        What's on your mind?
      </label>
      <textarea
        id="post-body"
        {...register("body")}
        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        rows={3}
        placeholder={`What's on your mind, ${user?.name?.split(" ")[0] || "friend"}?`}
        maxLength={MAX_BODY}
      />
      <div className="flex items-center justify-between mt-1">
        <p className="text-sm text-red-600 min-h-[1.25rem]">{errors.body?.message}</p>
        <span
          className={`text-xs ${
            (bodyValue?.length || 0) > MAX_BODY - 20 ? "text-rose-500" : "text-gray-400"
          }`}
        >
          {bodyValue?.length || 0}/{MAX_BODY}
        </span>
      </div>

      <input
        onChange={handleImageChange}
        type="file"
        id="image"
        className="hidden"
        accept="image/*"
      />

      {imagePreview ? (
        <div className="relative mt-2">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full max-h-96 object-cover rounded-xl"
          />
          <button
            type="button"
            onClick={() => setImageFile(null)}
            aria-label="Remove image"
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      ) : (
        <label
          htmlFor="image"
          className="mt-2 block border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-6 px-4 text-center cursor-pointer hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition"
        >
          <div className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400">
            <svg className="w-7 h-7 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
              <path d="M3 17l5-5 4 4 3-3 6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="10" r="1.5" fill="currentColor" />
            </svg>
            <span className="text-sm font-medium">Add a photo</span>
            <span className="text-xs">Click or drop an image here</span>
          </div>
        </label>
      )}

      <div className="flex items-center justify-end mt-3">
        <button
          type="submit"
          disabled={isPending || !canSubmit}
          className="rounded-xl px-5 py-2 font-semibold bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50"
        >
          {isPending ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}
