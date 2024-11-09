// Import necessary modules and components from React, React Router, and custom components
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/Home';
import Tenants from './pages/Tenants';
import Apartments from './pages/Apartments';
import Keys from './pages/Keys';
import Users from './pages/Users';
import { LoginForm } from './components/LoginForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { initDatabase } from './db/database';

// Main application component
function App() {
  // Initialize the database once when the component mounts
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase(); // Asynchronously initialize the database
      } catch (error) {
        console.error('Failed to initialize database:', error); // Log error if database initialization fails
      }
    };
    init(); // Call the initialization function
  }, []); // Empty dependency array ensures this runs only once

  return (
    // Provide authentication context to the app for handling user state
    <AuthProvider>
      <Router> {/* Set up client-side routing */}
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Navbar /> {/* Display navigation bar at the top */}
          <main>
            <Routes>
              {/* Public route for login */}
              <Route path="/login" element={<LoginForm />} />

              {/* Protected route for users, accessible only to superuser role */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute requiredRoles={['superuser']}>
                    <Users />
                  </ProtectedRoute>
                }
              />

              {/* Protected route for tenants, accessible to specific roles */}
              <Route
                path="/tenants"
                element={
                  <ProtectedRoute requiredRoles={['superuser', 'admin', 'maintenance']}>
                    <Tenants />
                  </ProtectedRoute>
                }
              />

              {/* Protected route for apartments, accessible to specific roles */}
              <Route
                path="/apartments"
                element={
                  <ProtectedRoute requiredRoles={['superuser', 'admin', 'maintenance']}>
                    <Apartments />
                  </ProtectedRoute>
                }
              />

              {/* Protected route for keys, accessible to specific roles */}
              <Route
                path="/keys"
                element={
                  <ProtectedRoute requiredRoles={['superuser', 'admin', 'maintenance']}>
                    <Keys />
                  </ProtectedRoute>
                }
              />

              {/* Protected route for homepage, accessible to all defined roles */}
              <Route
                path="/"
                element={
                  <ProtectedRoute requiredRoles={['superuser', 'admin', 'maintenance', 'viewer']}>
                    <HomePage />
                  </ProtectedRoute>
                }
              />

              {/* Redirect all unknown routes to the homepage */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; // Export the main App component as the default export
