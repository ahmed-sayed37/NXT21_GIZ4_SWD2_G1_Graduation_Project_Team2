export default function PostSkeleton() {
  return (
    <div className="my-7">
      <div className="shadow-2xl bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 md:rounded-3xl p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-2 w-1/6 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-4/6 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-40 mt-4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}
