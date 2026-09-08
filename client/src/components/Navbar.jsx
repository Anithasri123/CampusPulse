import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Activity, Menu, X, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();

  // Dynamic Navigation Items based on Auth State & Role
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Events', path: '/events' },
  ];

  if (isAuthenticated && isStudent) {
    navItems.push({ label: 'My Events', path: '/my-events' });
  }

  if (isAuthenticated && isAdmin) {
    navItems.push({ label: 'Admin', path: '/admin' });
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                CampusPulse
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-indigo-400 -mt-1">
                Event Hub
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items & User Actions */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="h-5 w-px bg-slate-800" />

            {/* Auth Buttons / Profile Indicator */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium">
                  {isAdmin ? (
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isAdmin ? 'bg-purple-950 text-purple-400 border border-purple-800/60' : 'bg-indigo-950 text-indigo-400 border border-indigo-800/60'
                    }`}
                  >
                    {user?.role}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/50 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-4 pt-3 pb-5 space-y-2 shadow-2xl animate-in slide-in-from-top duration-200">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <div className="pt-2 border-t border-slate-800/80">
            {isAuthenticated ? (
              <div className="space-y-3 pt-1">
                <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-200">{user?.name}</span>
                  <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                    {user?.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 bg-red-950/40 border border-red-900/50 hover:bg-red-950/70 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

