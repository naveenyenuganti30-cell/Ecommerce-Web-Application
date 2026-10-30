import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Products', path: '/admin/products', icon: Package, end: false },
    { name: 'Categories', path: '/admin/categories', icon: Layers, end: false },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag, end: false },
    { name: 'Customers', path: '/admin/customers', icon: Users, end: false },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col md:flex-row transition-colors">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-deep-teal-900 text-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10"
            aria-label="Toggle admin menu"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-bold text-lg">ShopSphere Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-300 hover:text-white"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-orange-accent" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-deep-teal-900 text-gray-300 flex flex-col z-50 transition-transform duration-200 border-r border-teal-mid/30 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-accent flex items-center justify-center text-white shadow-soft">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Admin<span className="text-aqua">Hub</span>
              </span>
              <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                ShopSphere Control
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-aqua text-deep-teal-950 font-semibold shadow-soft'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-aqua" />
            Return to Store
          </Link>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between px-2">
            <div className="truncate max-w-[140px]">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top bar for desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage products, inventory, customers, and order workflows</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-orange-accent" /> : <Moon className="w-5 h-5 text-deep-teal" />}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
              <div className="w-9 h-9 rounded-xl bg-orange-accent/10 text-orange-accent font-bold flex items-center justify-center text-sm">
                A
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900 dark:text-white block leading-tight">
                  {user?.name}
                </span>
                <span className="text-[11px] text-orange-accent font-medium">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
