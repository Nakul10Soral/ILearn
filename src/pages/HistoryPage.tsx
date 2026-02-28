import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import type { ContentItem, HistoryItem } from '../lib/types';
import { MainLayout } from '../components/MainLayout';
import { formatDate } from '../lib/utils';
// import { getHistory, deleteHistoryItem, clearHistory } from '../api/apiFuncitons';
// import { useAuth } from '../contexts/AuthContext';

export function HistoryPage() {
  const [history] = useState<(HistoryItem & { content: ContentItem })[]>([]);
  const [loading] = useState(true);
  // const { user } = useAuth();

  // useEffect(() => {
  //   if (user) {
  //     loadHistory();
  //   }
  // }, [user]);

  // const loadHistory = async () => {
  // if (!user) return;
  // setLoading(true);

  //   try {
  //     const data = await getHistory();
  //     setHistory(data);
  //   } catch (error) {
  //     console.error('Error loading history:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleDelete = async (id: string) => {
  //   try {
  //     await deleteHistoryItem(id);
  //     setHistory(history.filter((h) => h.id !== id));
  //   } catch (error) {
  //     console.error('Error deleting history:', error);
  //   }
  // };

  // const handleClearAll = async () => {
  //   if (!user || !window.confirm('Clear all history?')) return;

  //   try {
  //     await clearHistory();
  //     setHistory([]);
  //   } catch (error) {
  //     console.error('Error clearing history:', error);
  //   }
  // };

  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Watch history
          </h1>
          {history.length > 0 && (
            <button
              // onClick={handleClearAll}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition group"
              >
                {/* {item.content?.thumbnail_url ? (
                  <img
                    src={item.content.thumbnail_url}
                    alt={item.content?.title}
                    className="w-24 h-14 rounded object-cover flex-shrink-0"
                  />
                ) : ( */}
                <div className="w-24 h-14 rounded bg-gray-800 flex-shrink-0" />
                {/* // )} */}

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/content/${item.content_item_id}`}
                    className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2"
                  >
                    {item.content?.title}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatDate(new Date(item.watched_at))}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/content/${item.content_item_id}`}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition opacity-0 group-hover:opacity-100"
                  >
                    <ArrowRight size={18} className="text-gray-600 dark:text-gray-400" />
                  </Link>
                  <button
                    // onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2
                      size={18}
                      className="text-red-600 dark:text-red-400"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No watch history yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Start watching content to build your history
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
