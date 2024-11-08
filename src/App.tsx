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

function App() {
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    init();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Navbar />
          <main>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route
                path="/users"
                element={
                  <ProtectedRoute requiredRoles={['superuser']}>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenants"
                element={
                  <ProtectedRoute requiredRoles={['superuser', 'admin', 'maintenance']}>
                    <Tenants />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/apartments"
                element={
                  <ProtectedRoute requiredRoles={['superuser', 'admin', 'maintenance']}>
                    <Apartments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/keys"
                element={
                  <ProtectedRoute requiredRoles={['superuser', 'admin', 'maintenance']}>
                    <Keys />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute requiredRoles={['superuser', 'admin', 'maintenance', 'viewer']}>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;