import { useContext, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Modal from "../Modal/Modal";
import { updateProfile, DEFAULT_PHOTO } from "../../api/mockApi";
import { AuthContext } from "../../context/AuthContextStore";

export default function EditProfileModal({ open, onClose, user }) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [location, setLocation] = useState(user.location || "");
  const [photoPreview, setPhotoPreview] = useState(user.photo);
  const photoInput = useRef(null);

  const queryClient = useQueryClient();
  const { refreshUser } = useContext(AuthContext);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateProfile({
        name,
        bio,
        location,
        photoFile: photoInput.current?.files?.[0] || null,
      }),
    onSuccess: () => {
      toast.success("Profile updated");
      refreshUser();
      queryClient.invalidateQueries();
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to update"),
  });

  function onPhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit profile">
      <div className="flex flex-col items-center gap-3 mb-4">
        <img
          src={photoPreview}
          onError={(e) => (e.target.src = DEFAULT_PHOTO)}
          alt=""
          className="w-24 h-24 rounded-full object-cover ring-2 ring-violet-500"
        />
        <label className="cursor-pointer text-sm text-violet-600 hover:underline">
          Change photo
          <input
            type="file"
            ref={photoInput}
            accept="image/*"
            onChange={onPhotoChange}
            className="hidden"
          />
        </label>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="profile-name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
        <div>
          <label htmlFor="profile-location" className="block text-sm font-medium mb-1">
            Location
          </label>
          <input
            id="profile-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Cairo"
            className="w-full p-2 rounded border border-gray-300 dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
        <div>
          <label htmlFor="profile-bio" className="block text-sm font-medium mb-1">
            Bio
          </label>
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={200}
            className="w-full p-2 rounded border border-gray-300 dark:bg-gray-800 dark:border-gray-600 resize-none"
          />
          <div className="text-right text-xs text-gray-400">{bio.length}/200</div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => mutate()}
          disabled={isPending || !name.trim()}
          className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </Modal>
  );
}
