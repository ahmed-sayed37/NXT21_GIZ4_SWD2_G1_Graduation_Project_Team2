export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
      <span className="block text-sm text-center text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Social App · DEPI Graduation Project — Team 2
      </span>
    </footer>
  );
}
