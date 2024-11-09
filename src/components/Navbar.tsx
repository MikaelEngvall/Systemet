import React, { useState } from 'react'; // Import React and useState hook
import { Link, useNavigate } from 'react-router-dom'; // Import Link for navigation and useNavigate hook for programmatic navigation
import { Home, Users, Building2, Key, Menu, X, LogOut, UserCog } from 'lucide-react'; // Import icons from Lucide
import { ThemeToggle } from './ThemeToggle'; // Import ThemeToggle component to switch themes
import { Logo } from './Logo'; // Import the Logo component
import { useAuth } from '../contexts/AuthContext'; // Import custom authentication context hook

export function Navbar() {
  // State for toggling mobile menu visibility
  const [isOpen, setIsOpen] = useState(false);

  // Destructuring authentication context to get user, logout function, and authorization status
  const { user, logout, isAuthorized } = useAuth();

  // useNavigate hook for programmatic navigation
  const navigate = useNavigate();

  // Function to toggle the mobile menu open/close
  const toggleMenu = () => setIsOpen(!isOpen);

  // Function to handle user logout
  const handleLogout = () => {
    logout(); // Call logout function from context
    navigate('/login'); // Redirect user to login page after logging out
  };

  // NavLink component for rendering navigation links with icons and role-based authorization
  const NavLink = ({ to, icon: Icon, children, requiredRoles }: {
    to: string;
    icon: React.ElementType; // Icon component type
    children: React.ReactNode; // Text for the link
    requiredRoles: ('superuser' | 'admin' | 'maintenance' | 'viewer')[]; // Array of roles allowed to access the link
  }) => {
    // Check if the user has one of the required roles before rendering the link
    if (!isAuthorized(requiredRoles)) return null;

    // Return a Link component with an icon and text
    return (
      <Link 
        to={to} 
        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-brand-light dark:hover:text-brand-dark transition-colors"
        onClick={() => setIsOpen(false)} // Close the mobile menu on link click
      >
        {/* Render the provided icon */}
        <Icon className="w-5 h-5 mr-2" />
        <span>{children}</span>
      </Link>
    );
  };

  // If no user is logged in, do not render the navbar
  if (!user) {
    return null;
  }

  return (
    // Main navbar container
    <nav className="bg-white dark:bg-[#1C2833] shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        {/* Flex container for the navbar layout */}
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            {/* Logo and home link */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Logo className="h-12 md:h-16" />
            </Link>
            {/* Desktop links - visible on medium screens and larger */}
            <div className="hidden md:flex ml-10 space-x-8">
              {/* Render navigation links for different sections of the app */}
              <NavLink to="/" icon={Home} requiredRoles={['superuser', 'admin', 'maintenance', 'viewer']}>Home</NavLink>
              <NavLink to="/tenants" icon={Users} requiredRoles={['superuser', 'admin', 'maintenance']}>Tenants</NavLink>
              <NavLink to="/apartments" icon={Building2} requiredRoles={['superuser', 'admin', 'maintenance']}>Apartments</NavLink>
              <NavLink to="/keys" icon={Key} requiredRoles={['superuser', 'admin', 'maintenance']}>Keys</NavLink>
              <NavLink to="/users" icon={UserCog} requiredRoles={['superuser']}>Users</NavLink>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Display user role on the right side of the navbar */}
            <div className="hidden md:flex items-center text-sm text-gray-700 dark:text-gray-300">
              <span className="px-2 py-1 rounded-full bg-brand-light dark:bg-brand-dark text-white text-xs">
                {user.role} {/* Display the user's role */}
              </span>
            </div>
            {/* ThemeToggle component for switching between light and dark themes */}
            <ThemeToggle />
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="text-gray-700 dark:text-gray-300 hover:text-brand-light dark:hover:text-brand-dark"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" /> {/* Logout icon */}
            </button>
            {/* Mobile menu toggle button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {/* Show Menu or X icon based on menu state */}
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - shown when isOpen is true */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden transition-all duration-200 ease-in-out`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-[#1C2833] shadow-lg">
          {/* Render mobile navigation links */}
          <NavLink to="/" icon={Home} requiredRoles={['superuser', 'admin', 'maintenance', 'viewer']}>Home</NavLink>
          <NavLink to="/tenants" icon={Users} requiredRoles={['superuser', 'admin', 'maintenance']}>Tenants</NavLink>
          <NavLink to="/apartments" icon={Building2} requiredRoles={['superuser', 'admin', 'maintenance']}>Apartments</NavLink>
          <NavLink to="/keys" icon={Key} requiredRoles={['superuser', 'admin', 'maintenance']}>Keys</NavLink>
          <NavLink to="/users" icon={UserCog} requiredRoles={['superuser']}>Users</NavLink>
          {/* Display the user's role in the mobile menu */}
          <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="mt-1">
              <span className="px-2 py-1 rounded-full bg-brand-light dark:bg-brand-dark text-white text-xs">
                {user.role} {/* Display user role */}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
