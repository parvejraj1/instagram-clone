import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

interface SignUpPageProps {
  onLogin: () => void;
}

export function SignUpPage({ onLogin }: SignUpPageProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const createUser = useMutation(api.users.createUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation checks
    if (!username) {
      setError('Username is required');
      return;
    }
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (!confirmPassword) {
      setError('Please confirm your password');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      // Create user in Convex
      await createUser({
        userId: username,
        username: username,
      }).catch(err => {
        if (err.message.includes("already taken")) {
          throw new Error("Username already taken");
        }
        throw err;
      });

      // Store authentication state
      localStorage.setItem('userId', username);
      localStorage.setItem('username', username);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Call the login callback and navigate
      onLogin();
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Create Account</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Sign in
          </button>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              minLength={3}
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              minLength={6}
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mb-4"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
