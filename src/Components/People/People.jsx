import { useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PersonCard from "../PersonCard/PersonCard";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { listPeople, listLocations } from "../../api/mockApi";
import { AuthContext } from "../../context/AuthContextStore";

export default function People() {
  useDocumentTitle("Discover People");
  const { user } = useContext(AuthContext);

  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [nearbyOnly, setNearbyOnly] = useState(false);

  const effectiveLocation = useMemo(() => {
    if (nearbyOnly) return user?.location || "";
    return location;
  }, [nearbyOnly, location, user]);

  const { data: locationsData } = useQuery({
    queryKey: ["listLocations"],
    queryFn: () => listLocations(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["listPeople", q, effectiveLocation],
    queryFn: () => listPeople({ q, location: effectiveLocation }),
  });

  const locations = locationsData?.data?.locations || [];
  const people = data?.data?.people || [];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
        <h1 className="text-2xl font-bold mb-3">Discover people</h1>
        <div className="grid sm:grid-cols-3 gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or city…"
            className="sm:col-span-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
          />
          <select
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setNearbyOnly(false);
            }}
            disabled={nearbyOnly}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-60"
          >
            <option value="">Any location</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 mt-3 text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
          <input
            type="checkbox"
            checked={nearbyOnly}
            onChange={(e) => setNearbyOnly(e.target.checked)}
            disabled={!user?.location}
          />
          <span>
            📍 Nearby only
            {user?.location ? (
              <> · in <strong>{user.location}</strong></>
            ) : (
              <span className="text-gray-400 ml-2">
                (set your location in Settings)
              </span>
            )}
          </span>
        </label>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-56 bg-white/60 dark:bg-gray-800/60 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : people.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 text-center text-gray-600 dark:text-gray-300">
          No people found.{" "}
          {effectiveLocation && (
            <>
              Try clearing the location filter — currently <strong>{effectiveLocation}</strong>.
            </>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {people.map((p) => (
            <PersonCard key={p._id} person={p} />
          ))}
        </div>
      )}
    </div>
  );
}
