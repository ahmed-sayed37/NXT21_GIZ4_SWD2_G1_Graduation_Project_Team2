import { useRef, useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function CreatePost() {
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const captionInput = useRef(null);
  const imageInput = useRef(null);

  const queryClient = useQueryClient();

  function createPost() {
    const formData = new FormData();
    if (captionInput.current.value) {
      formData.append("body", captionInput.current.value);
    }
    if (imageInput.current.value) {
      formData.append("image", imageInput.current.files[0]);
    }
    return axios.post("https://linked-posts.routemisr.com/posts", formData, {
      headers: {
        token: localStorage.getItem("tkn"),
      },
    });
  }

  const { isPending, mutate } = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      toast.success("Post created");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["getPosts"] });
      queryClient.invalidateQueries({ queryKey: ["getUserPosts"] });
    },
    onError: () => {
      toast.error("Failed to create post");
    },
  });

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImagePreview(null);
    imageInput.current.value = "";
  }

  function closeModal() {
    removeImage();
    captionInput.current.value = "";
    setIsModalOpened(false);
  }

  return (
    <div>
      <div className="bg-white editor mx-auto w-10/12 flex flex-col text-gray-800 p-4 shadow-lg max-w-2xl rounded-2xl">
        <input
          onClick={() => setIsModalOpened(true)}
          ref={captionInput}
          className="title bg-gray-100 border border-gray-300 p-2 mb-4 outline-none"
          spellCheck="false"
          placeholder="Title"
          type="text"
        />

        {isModalOpened && (
          <textarea
            className="description bg-gray-100 sec p-3 h-60 border border-gray-300 outline-none"
            spellCheck="false"
            placeholder="Describe everything about this post here"
            defaultValue=""
          />
        )}

        {imagePreview && (
          <div className="relative">
            <img src={imagePreview} alt="Preview" className="w-full h-96 rounded-lg" />
            <svg
              onClick={removeImage}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="absolute top-0 right-1 cursor-pointer bg-red-500 w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}

        <div className="icons flex text-gray-500 m-2">
          <label htmlFor="image">
            <input
              onChange={handleImageChange}
              ref={imageInput}
              type="file"
              id="image"
              className="hidden"
              accept="image/*"
            />
            <svg
              className="mr-2 cursor-pointer hover:text-gray-700 border rounded-full p-1 h-7"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </label>
          <div className="count ml-auto text-gray-400 text-xs font-semibold">0/300</div>
        </div>

        <div className="buttons flex">
          <button
            type="button"
            disabled={isPending}
            onClick={closeModal}
            className="rounded-xl btn border border-gray-300 p-1 px-4 font-semibold cursor-pointer text-gray-500 ml-auto disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => mutate()}
            className="rounded-xl btn border border-indigo-500 p-1 px-4 font-semibold cursor-pointer text-gray-200 ml-2 bg-indigo-500 disabled:opacity-60"
          >
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
