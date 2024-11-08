import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Users, Building2, Key, Menu, X, LogOut, UserCog } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthorized } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLink = ({ to, icon: Icon, children, requiredRoles }: {
    to: string;
    icon: React.ElementType;
    children: React.ReactNode;
    requiredRoles: ('superuser' | 'admin' | 'maintenance' | 'viewer')[];
  }) => {
    if (!isAuthorized(requiredRoles)) return null;

    return (
      <Link 
        to={to} 
        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-brand-light dark:hover:text-brand-dark transition-colors"
        onClick={() => setIsOpen(false)}
      >
        <Icon className="w-5 h-5 mr-2" />
        <span>{children}</span>
      </Link>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white dark:bg-[#1C2833] shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Logo className="h-12 md:h-16" />
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <NavLink to="/" icon={Home} requiredRoles={['superuser', 'admin', 'maintenance', 'viewer']}>Home</NavLink>
              <NavLink to="/tenants" icon={Users} requiredRoles={['superuser', 'admin', 'maintenance']}>Tenants</NavLink>
              <NavLink to="/apartments" icon={Building2} requiredRoles={['superuser', 'admin', 'maintenance']}>Apartments</NavLink>
              <NavLink to="/keys" icon={Key} requiredRoles={['superuser', 'admin', 'maintenance']}>Keys</NavLink>
              <NavLink to="/users" icon={UserCog} requiredRoles={['superuser']}>Users</NavLink>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center text-sm text-gray-700 dark:text-gray-300">
              <span className="px-2 py-1 rounded-full bg-brand-light dark:bg-brand-dark text-white text-xs">
                {user.role}
              </span>
            </div>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="text-gray-700 dark:text-gray-300 hover:text-brand-light dark:hover:text-brand-dark"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden transition-all duration-200 ease-in-out`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-[#1C2833] shadow-lg">
          <NavLink to="/" icon={Home} requiredRoles={['superuser', 'admin', 'maintenance', 'viewer']}>Home</NavLink>
          <NavLink to="/tenants" icon={Users} requiredRoles={['superuser', 'admin', 'maintenance']}>Tenants</NavLink>
          <NavLink to="/apartments" icon={Building2} requiredRoles={['superuser', 'admin', 'maintenance']}>Apartments</NavLink>
          <NavLink to="/keys" icon={Key} requiredRoles={['superuser', 'admin', 'maintenance']}>Keys</NavLink>
          <NavLink to="/users" icon={UserCog} requiredRoles={['superuser']}>Users</NavLink>
          <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="mt-1">
              <span className="px-2 py-1 rounded-full bg-brand-light dark:bg-brand-dark text-white text-xs">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}