import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4 break-words">
              {this.state.error?.message || "Unexpected error"}
            </p>
            <button
              onClick={() => {
                this.reset();
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
