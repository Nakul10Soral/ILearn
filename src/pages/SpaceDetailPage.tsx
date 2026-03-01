import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Link as LinkIcon, Upload, X, FileText } from 'lucide-react';
import type { Space, ContentItem } from '../lib/types';
import { MainLayout } from '../components/MainLayout';
import { ContentCard } from '../components/ContentCard';
import { useAuth } from '../contexts/AuthContext.tsx';
import { createLecture, getSpaceById } from '../api/apiFuncitons.ts';

export function SpaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [space, setSpace] = useState<Space | null>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddContent, setShowAddContent] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [vttDriveUrl, setVttDriveUrl] = useState('');
  const [vttType, setVttType] = useState<'file' | 'drive'>('drive');
  const [isDragging, setIsDragging] = useState(false);
  const [adding, setAdding] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (id && user) {
      loadSpaceData();
    }
  }, [id, user]);

  const loadSpaceData = async () => {
    if (!id || !user) return;
    setLoading(true);

    try {
      const response = await getSpaceById(id)
      if (response) {
        setSpace(response.space);
        setContents(response.lectures);
      }
    } catch (error) {
      console.error('Error loading space:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.vtt')) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contentTitle.trim() || !videoUrl.trim() || !space || !user) return;

    setAdding(true);

    try {
      let vttContent = null;
      if (vttType === 'file') {

        if (selectedFile) {
          vttContent = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject("Failed to read file");

            reader.readAsText(selectedFile);
          });
        }
      } else {
        vttContent = vttDriveUrl;
      }

      const response = await createLecture({
        title: contentTitle,
        videoUrl,
        space_id: space._id,
        vttUrl: vttContent || '',
      });

      if (response) {
        setContents([response.lectures[0], ...contents]);
        setContentTitle('');
        setVideoUrl('');
        setSelectedFile(null);
        setShowAddContent(false);
      }
    } catch (error) {
      console.error('Error adding content:', error);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!space) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600 dark:text-gray-400">Space not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {space.name}
          </h1>
          {space.description && (
            <p className="text-gray-600 dark:text-gray-400">{space.description}</p>
          )}
        </div>

        <div className="mb-8 flex gap-2">
          <button
            onClick={() => setShowAddContent(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition"
          >
            <Plus size={20} />
            Add content
          </button>
        </div>

        {contents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contents.map((content) => (
              <ContentCard key={content._id} content={content} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No content in this space yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Add your first piece of content to get started
            </p>
          </div>
        )}
      </div>

      {showAddContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Add content to {space.name}
            </h2>
            <form onSubmit={handleAddContent}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content title
                  </label>
                  <input
                    type="text"
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    placeholder="e.g., Introduction to React"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <LinkIcon size={16} />
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="e.g., https://www.youtube.com/embed/..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <div className='flex justify-between mb-2'>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FileText size={16} />
                      VTT File <span className="text-xs text-gray-500 dark:text-gray-400">{vttType === 'drive' ? '(Google Drive public link only)' : '(optional)'}</span>
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setVttType('drive')}
                        className={`px-4 text-xm rounded-lg border ${vttType === 'drive' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500/50'
                          }`}
                      >
                        link
                      </button>
                      <button
                        type="button"
                        onClick={() => setVttType('file')}
                        className={`px-4 py-2 rounded-lg border ${vttType === 'file' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500/50'
                          }`}
                      >
                        File
                      </button>
                    </div>
                  </div>

                  <div>
                    {
                      vttType === "drive" ? (
                        <div>
                          <input
                            type="url"
                            value={vttDriveUrl}
                            onChange={(e) => setVttDriveUrl(e.target.value)}
                            placeholder="e.g., https://drive.google.com/file/d/..."
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      ) : (
                        <>
                          {!selectedFile ? (
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer ${isDragging
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500/50'
                                }`}
                              onClick={() => document.getElementById('file-upload')?.click()}
                            >
                              <input
                                id="file-upload"
                                type="file"
                                accept=".vtt"
                                onChange={handleFileSelect}
                                className="hidden"
                              />
                              <div className={`p-3 rounded-full ${isDragging ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-800'} transition-colors`}>
                                <Upload size={24} className={isDragging ? 'text-indigo-600' : 'text-gray-500'} />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  Click or drag VTT file here
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Only .vtt files are supported
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600">
                                  <FileText size={20} />
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {selectedFile.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedFile(null)}
                                className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-full text-gray-500 hover:text-indigo-600 transition-colors"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          )}
                        </>
                      )
                    }
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddContent(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
