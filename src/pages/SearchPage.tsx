import { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import type { ContentItem } from '../lib/types';
import { MainLayout } from '../components/MainLayout';
import { ContentCard } from '../components/ContentCard';
// import { searchContent } from '../api/apiFuncitons';
import { useAuth } from '../contexts/AuthContext';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
        setSearched(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim() || !user) return;

    setLoading(true);
    setSearched(true);

    // try {
    //   const data = await searchContent(query);
    //   setResults(data || []);
    // } catch (error) {
    //   console.error('Error searching:', error);
    //   setResults([]);
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Search content
        </h1>

        <div className="relative mb-8">
          <SearchIcon
            size={20}
            className="absolute left-4 top-3 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {searched && !loading && (
          <>
            {results.length > 0 ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Found {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.map((content) => (
                    <ContentCard key={content._id} content={content} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <SearchIcon
                  size={48}
                  className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
                />
                <p className="text-gray-600 dark:text-gray-400">
                  No results found for "{query}"
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </>
        )}

        {!searched && (
          <div className="text-center py-12">
            <SearchIcon
              size={48}
              className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
            />
            <p className="text-gray-600 dark:text-gray-400">
              Start typing to search your content
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
