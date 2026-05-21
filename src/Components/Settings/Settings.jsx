import { useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { updateProfile, DEFAULT_PHOTO } from "../../api/mockApi";
import { AuthContext } from "../../context/AuthContextStore";
import { ThemeContext } from "../../context/ThemeContextStore";

export default function Settings() {
  useDocumentTitle("Settings");
  const { user, refreshUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoInput = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || "");
      setLocation(user.location || "");
      setPhotoPreview(user.photo);
    }
  }, [user]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      updateProfile({
        name,
        bio,
        location,
        photoFile: photoInput.current?.files?.[0] || null,
      }),
    onSuccess: () => {
      toast.success("Settings saved");
      refreshUser();
      queryClient.invalidateQueries();
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed"),
  });

  function onPhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
  }

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Update your profile and preferences.
        </p>

        <div className="flex flex-col items-center gap-3 mb-6">
          <img
            src={photoPreview || DEFAULT_PHOTO}
            onError={(e) => (e.target.src = DEFAULT_PHOTO)}
            alt=""
            className="w-28 h-28 rounded-full object-cover ring-2 ring-violet-500"
          />
          <label className="cursor-pointer text-sm text-violet-600 hover:underline">
            Change photo
            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              onChange={onPhotoChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Location (city)">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Cairo"
              className={inputClass}
            />
          </Field>
          <Field label="Email" full>
            <input value={user.email} disabled className={`${inputClass} opacity-60`} />
          </Field>
          <Field label="Bio" full>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={200}
              className={`${inputClass} resize-none`}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {bio.length}/200
            </div>
          </Field>
        </div>

        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={() => save()}
            disabled={isPending || !name.trim()}
            className="px-5 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Dark mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Currently using <span className="capitalize">{theme}</span> theme.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Switch to {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-violet-500";

function Field({ label, children, full = false }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}
