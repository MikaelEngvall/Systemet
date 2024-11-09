import React, { useState, useEffect } from 'react'; // Importing necessary React hooks
import { useAuth } from '../contexts/AuthContext'; // Custom hook for authentication context
import { useNavigate, useLocation } from 'react-router-dom'; // Hooks for navigation and location tracking
import { Logo } from './Logo'; // Logo component

export function LoginForm() {
  // Destructure login function and user object from the AuthContext
  const { login, user } = useAuth(); 
  // useNavigate hook for redirecting to different routes
  const navigate = useNavigate();
  // useLocation hook to get the current location (used for redirection after login)
  const location = useLocation();

  // State for handling email, password, error message, and loading state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // useEffect hook that runs when the 'user' state changes (i.e., when the user logs in)
  useEffect(() => {
    if (user) {
      // If the user is logged in, redirect to the home page
      navigate('/');
    }
  }, [user, navigate]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setError(''); // Clear any existing error messages
    setIsLoading(true); // Set the loading state to true

    try {
      // Check if both email and password are provided
      if (!email.trim() || !password.trim()) {
        throw new Error('Email and password are required'); // Throw error if any field is empty
      }

      // Call the login function from the context, passing in email and password
      await login(email.trim(), password);

      // After login, check if there was a redirect target from the location state
      const from = location.state?.from?.pathname || '/'; // Default to '/' if no previous location is available
      navigate(from, { replace: true }); // Redirect the user to the original or default page
    } catch (err) {
      // Handle errors during login
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      // Set loading state to false once the login attempt is complete
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          {/* Render Logo component */}
          <Logo className="w-auto h-24" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          {/* Default credentials info for testing */}
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Default credentials: admin@duggals.se / Admin123!
          </p>
        </div>
        {/* Form for login */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Show error message if there's an error */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}
          {/* Input fields for email and password */}
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Email input */}
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email} // Bind email state to the input field
                onChange={(e) => setEmail(e.target.value)} // Update email state on input change
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-light focus:border-brand-light focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="Email address"
                disabled={isLoading} // Disable input when loading
              />
            </div>
            {/* Password input */}
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password} // Bind password state to the input field
                onChange={(e) => setPassword(e.target.value)} // Update password state on input change
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-light focus:border-brand-light focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="Password"
                disabled={isLoading} // Disable input when loading
              />
            </div>
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isLoading} // Disable button when loading
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-light dark:bg-brand-dark hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light disabled:opacity-50"
            >
              {/* Change button text when loading */}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
