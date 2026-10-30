import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Package,
  LogOut,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/catalog');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-deep-teal to-aqua flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform duration-200">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-deep-teal dark:text-white">
                Shop<span className="text-aqua">Sphere</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 -mt-1 hidden sm:block">
                Modern Commerce
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-4 relative"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, tech & gear..."
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2.5 rounded-full text-sm border border-transparent focus:border-aqua focus:bg-white dark:focus:bg-gray-900 focus:outline-none transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </form>

          {/* Navigation Links & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Link to="/" className="hover:text-aqua transition-colors">
                Home
              </Link>
              <Link to="/catalog" className="hover:text-aqua transition-colors">
                Catalog
              </Link>
            </nav>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-orange-accent" />
              ) : (
                <Moon className="w-5 h-5 text-deep-teal" />
              )}
            </button>

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-deep-teal dark:text-aqua" />
              {cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-accent text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {cart.itemCount > 99 ? '99+' : cart.itemCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-mid/10 dark:bg-aqua/20 text-teal-mid dark:text-aqua flex items-center justify-center font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-800 dark:text-gray-200 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-floating border border-gray-100 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-orange-accent/10 text-orange-accent">
                          Administrator
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-deep-teal dark:text-aqua font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <Package className="w-4 h-4" />
                      My Orders
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>

                    <div className="border-t border-gray-100 dark:border-gray-700 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-deep-teal dark:text-gray-200 hover:text-aqua transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2 rounded-full text-sm border border-transparent focus:border-aqua focus:bg-white dark:focus:bg-gray-900 focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            className="block py-2 text-base font-medium text-gray-800 dark:text-gray-200 hover:text-aqua"
          >
            Home
          </Link>
          <Link
            to="/catalog"
            className="block py-2 text-base font-medium text-gray-800 dark:text-gray-200 hover:text-aqua"
          >
            All Products & Catalog
          </Link>

          {isAuthenticated ? (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                My Account ({user.name})
              </p>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block py-2 text-sm font-semibold text-aqua"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                to="/orders"
                className="block py-2 text-sm text-gray-700 dark:text-gray-300"
              >
                My Orders & Tracking
              </Link>
              <Link
                to="/profile"
                className="block py-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 text-sm text-red-600 dark:text-red-400"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2.5 rounded-xl bg-deep-teal text-white text-sm font-medium"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
