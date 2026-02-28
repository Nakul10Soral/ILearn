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
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg text-gray-900 dark:text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">i</span>
              </div>
              <span>iLearn</span>
            </Link>
          </div>

          <nav className="p-4 pt-0 space-y-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isActive('/')
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <Plus size={20} />
              <span>Add content</span>
            </Link>

            <Link
              to="/search"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isActive('/search')
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <Search size={20} />
              <span>Search</span>
            </Link>

            <Link
              to="/history"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isActive('/history')
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <Clock size={20} />
              <span>History</span>
            </Link>
          </nav>

          <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Help & Tools
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg w-full transition">
              <HelpCircle size={20} />
              <span>Quick Guide</span>
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === 'light' ? 'Dark' : 'Light'} mode</span>
          </button>

          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            <LogOut size={20} />
            <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
          </button>

          <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.username || 'User'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
