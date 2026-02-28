import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

import type { Space, ContentItem } from '../lib/types';
import { MainLayout } from '../components/MainLayout';
import { SpaceCard } from '../components/SpaceCard';
import { ContentCard } from '../components/ContentCard';
import { useAuth } from '../contexts/AuthContext.tsx';
import { createSpace, getSpaces } from '../api/apiFuncitons';

export function DashboardPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [recents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewSpaceModal, setShowNewSpaceModal] = useState(false);
  const [spaceTitle, setSpaceTitle] = useState('');
  const [spaceDescription, setSpaceDescription] = useState('');
  const [creatingSpace, setCreatingSpace] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getSpaces();
      setSpaces(data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceTitle.trim() || !user) return;

    setCreatingSpace(true);
    try {
      const newSpace = await createSpace(spaceTitle, spaceDescription);
      setSpaces([...spaces, newSpace]);
      setShowNewSpaceModal(false);
      setSpaceTitle('');
      setSpaceDescription('');
    } catch (error) {
      console.error('Error creating space:', error);
    } finally {
      setCreatingSpace(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 md:p-8 max-w-7xl h-screen flex items-center justify-center mx-auto">
          <div className="flex items-center justify-center spinner">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, <span className="capitalize text-indigo-600 dark:text-indigo-400">{user?.username?.split(' ')[0]}</span>!
          </h1>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Spaces
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => setShowNewSpaceModal(true)}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition flex items-center justify-center"
            >
              <div className="text-center">
                <Plus size={32} className="mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  New Space
                </p>
              </div>
            </button>

            {spaces.map((space) => (
              <SpaceCard key={space._id} space={space} />
            ))}
          </div>
        </div>

        {recents.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recents
              </h2>
              <Link
                to="/history"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recents.map((content) => (
                <ContentCard key={content._id} content={content} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showNewSpaceModal && (
        <div className="fixed inset-0 bg-white/50 dark:bg-gray-700/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Create new space
            </h2>
            <form onSubmit={handleCreateSpace}>
              <input
                type="text"
                value={spaceTitle}
                onChange={(e) => setSpaceTitle(e.target.value)}
                placeholder="Space name"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                required
              />
              <textarea
                value={spaceDescription}
                onChange={(e) => setSpaceDescription(e.target.value)}
                placeholder="Space description"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewSpaceModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSpace}
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {creatingSpace ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
