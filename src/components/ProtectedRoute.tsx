import React from 'react'; // Import React for JSX syntax
import { Navigate, useLocation } from 'react-router-dom'; // Import Navigate for redirecting, and useLocation for accessing the current location
import { useAuth } from '../contexts/AuthContext'; // Import the custom useAuth hook for authentication context
import { UserRole } from '../types'; // Import UserRole type to define the possible roles for the user

// Define the props for the ProtectedRoute component
interface ProtectedRouteProps {
  children: React.ReactNode; // The children to render when the user is authorized
  requiredRoles: UserRole[]; // The roles that are required to access the route
}

// ProtectedRoute component to wrap around routes that require authentication and specific roles
export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  // Destructure the user object and isAuthorized function from the authentication context
  const { user, isAuthorized } = useAuth();

  // Use the useLocation hook to get the current location (useful for redirecting to the original page after login)
  const location = useLocation();

  // Check if the user is not authenticated (user is null)
  if (!user) {
    // If not authenticated, redirect to the login page and pass the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the user is not authorized to access the route based on their roles
  if (!isAuthorized(requiredRoles)) {
    // If not authorized, redirect to the home page
    return <Navigate to="/" replace />;
  }

  // If the user is authenticated and authorized, render the children (the actual content of the protected route)
  return <>{children}</>;
}
