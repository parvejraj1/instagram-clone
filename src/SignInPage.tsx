import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SignInPageProps {
  onLogin: () => void;
}

export function SignInPage({ onLogin }: SignInPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation checks
    if (!username) {
      setError("Username is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      // Here you would typically verify the user credentials with your backend
      // For this example, we'll just do a simple authentication
      
      // Store authentication state
      localStorage.setItem("userId", username);
      localStorage.setItem("username", username);
      
      // Call onLogin first to set the app state
      onLogin();
      
      // Then navigate to the app
      navigate("/app");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Sign In</h2>
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mb-4"
          >
            Sign In
          </button>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button
              className="text-blue-500 hover:text-blue-600 font-medium"
              onClick={() => navigate('/sign-up')}
            >
              Create one now
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
