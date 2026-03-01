import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Plus,
  Search,
  Clock,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      logout();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { to: '/', icon: <Plus size={20} />, label: 'Add content' },
    { to: '/search', icon: <Search size={20} />, label: 'Search' },
    { to: '/history', icon: <Clock size={20} />, label: 'History' },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg text-gray-900 dark:text-white"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 z-40
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'w-16' : 'w-64'}
        `}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          <div className={`p-4 flex items-center ${collapsed ? 'justify-center' : 'gap-2'}`}>
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 shrink-0 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">i</span>
              </div>
              {!collapsed && (
                <span className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                  iLearn
                </span>
              )}
            </Link>
          </div>

          {/* Nav */}
          <nav className="p-2 space-y-1">
            {navItems.map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition
                  ${collapsed ? 'justify-center' : ''}
                  ${isActive(to)
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <span className="shrink-0">{icon}</span>
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            ))}
          </nav>

          {/* Help */}
          <div className={`px-2 py-4 border-t border-gray-200 dark:border-gray-800`}>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                Help & Tools
              </h3>
            )}
            <button
              title={collapsed ? 'Quick Guide' : undefined}
              className={`flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg w-full transition ${collapsed ? 'justify-center' : ''}`}
            >
              <HelpCircle size={20} className="shrink-0" />
              {!collapsed && <span>Quick Guide</span>}
            </button>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-2 space-y-1">
          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition w-full ${collapsed ? 'justify-center' : ''}`}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span className="text-sm">Collapse</span>}
          </button>

          <button
            onClick={toggleTheme}
            title={collapsed ? (theme === 'light' ? 'Dark mode' : 'Light mode') : undefined}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition ${collapsed ? 'justify-center' : ''}`}
          >
            {theme === 'light' ? <Moon size={20} className="shrink-0" /> : <Sun size={20} className="shrink-0" />}
            {!collapsed && <span>{theme === 'light' ? 'Dark' : 'Light'} mode</span>}
          </button>

          <button
            onClick={handleSignOut}
            disabled={isLoading}
            title={collapsed ? 'Sign out' : undefined}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50 ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>}
          </button>

          {/* User avatar */}
          <div className={`flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-800 ${collapsed ? 'justify-center' : ''}`}>
            <div
              title={collapsed ? (user?.username || 'User') : undefined}
              className="w-9 h-9 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm"
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.username || 'User'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}