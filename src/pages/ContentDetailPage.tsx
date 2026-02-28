import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { BookMarked, Zap, Music, FileText, HelpCircle, Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ContentItem, Chapter, Transcript } from '../lib/types';
import { MainLayout } from '../components/MainLayout';
import { getLectureById, askQuestion, chatHistory, getAvailableModels } from '../api/apiFuncitons';
import { useAuth } from '../contexts/AuthContext';
import { Dropdown } from '../components/Dropdown.tsx';

export function ContentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [chapters] = useState<Chapter[]>([]);
  const [showTimeStamps, setShowTimeStamps] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chapters' | 'transcripts'>('transcripts');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, timestamp?: string }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  const [leftWidthPct, setLeftWidthPct] = useState(66.67);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const onDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawPct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidthPct(Math.min(75, Math.max(25, rawPct)));
    };
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const loadContent = async () => {
    if (!id || !user) return;
    setLoading(true);
    try {
      const data = await getLectureById(id);
      setContent(data.lecture);
      setTranscripts(data.transcript[0].segments);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        const data = await getAvailableModels();
        setSelectedModel(data.models[0].id);
        setModels(data.models);
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (id && user) loadContent();
  }, [id, user]);

  const loadChatHistory = async () => {
    if (!id || !user || !content) return;
    try {
      const data = await chatHistory({ space_id: content.space_id, lecture_id: id, user_id: user._id });
      if (Array.isArray(data.messages)) {
        setMessages(data.messages.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content || msg.message || msg.query || msg.response,
          timestamp: msg.timestamp,
        })));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  useEffect(() => {
    if (content) loadChatHistory();
  }, [content]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !id || !user || !content || isSending) return;
    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }]);
    try {
      const data = await askQuestion({
        space_id: content.space_id,
        lecture_id: id,
        user_id: user._id,
        question: userMessage
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || data.response || data.message,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error sending question:', error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !showTimeStamps) return;
    const update = () => {
      const time = video.currentTime;
      const active = transcripts.findIndex((s) => time >= s.start && time <= s.end);
      if (active !== -1 && active !== activeIndex) {
        setActiveIndex(active);
        document.getElementById(`transcript-${active}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    video.addEventListener('timeupdate', update);
    return () => video.removeEventListener('timeupdate', update);
  }, [showTimeStamps, transcripts, activeIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatTimestamp = (iso?: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const videoUrl = () => {
    if (content?.videoUrl.includes('https://mega.nz/file'))
      return content.videoUrl.replace('https://mega.nz/file', 'https://mega.nz/embed');
    if (content?.videoUrl.includes('https://youtu.be/'))
      return content.videoUrl.replace('https://youtu.be/', 'https://www.youtube.com/embed/');
    if (content?.videoUrl.includes('https://www.youtube.com/watch'))
      return content.videoUrl.replace('https://www.youtube.com/watch?v=', 'https://www.youtube.com/embed/');
    return '';
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

  if (!content) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600 dark:text-gray-400">Content not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 h-full lg:max-h-screen overflow-hidden">
        <div
          ref={containerRef}
          className="hidden lg:flex gap-0 max-w-7xl mx-auto h-full"
        >
          <div
            className="flex flex-col overflow-hidden"
            style={{ width: `${leftWidthPct}%`, minWidth: 0 }}
          >
            <div className="flex mb-2 pb-2 justify-between pr-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{content.title}</h1>
            </div>

            {content.videoUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 mb-4 mr-2">
                {!!videoUrl() ? (
                  <iframe src={videoUrl()} title={content.title} className="w-full h-full" allowFullScreen />
                ) : (
                  <video ref={videoRef} src={content.videoUrl} title={content.title} className="w-full h-full" controls />
                )}
              </div>
            ) : (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 mb-4 mr-2 flex items-center justify-center">
                <p className="text-gray-400">No video available</p>
              </div>
            )}

            <div className="flex-1 flex flex-col overflow-hidden pr-2">
              <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-800">
                {(['transcripts', 'chapters'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium border-b-2 capitalize transition ${activeTab === tab
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
                <button
                  onClick={() => setShowTimeStamps(!showTimeStamps)}
                  className={`px-4 py-2 font-medium border-b-2 capitalize transition ${activeTab === 'transcripts'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  {showTimeStamps ? 'Hide Timestamps' : 'Show Timestamps'}
                </button>
              </div>

              {activeTab === 'transcripts' && (
                <div className="p-3 rounded-lg dark:bg-gray-900 flex-1 flex flex-col min-h-0">
                  <div className="space-y-4 overflow-y-auto no-scrollbar flex-1">
                    {transcripts.length > 0 ? transcripts.map((transcript) => {
                      const originalIndex = transcripts.findIndex(t => t._id === transcript._id);
                      return (
                        <div
                          key={transcript._id}
                          id={`transcript-${originalIndex}`}
                          className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border transition-all ${activeIndex === originalIndex
                            ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                            : 'border-gray-200 dark:border-gray-700'
                            }`}
                        >
                          {transcript.start !== null && transcript.end !== null && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono">
                              {formatTime(transcript.start)} - {formatTime(transcript.end)}
                            </p>
                          )}
                          <p className="text-gray-900 dark:text-white text-sm leading-relaxed">{transcript.text}</p>
                        </div>
                      );
                    }) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">No transcripts available</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'chapters' && (
                <div className="space-y-3 overflow-y-auto no-scrollbar flex-1">
                  {chapters.length > 0 ? chapters.map((chapter) => (
                    <div key={chapter.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 cursor-pointer transition">
                      <div className="flex items-start gap-3">
                        <div className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-1">
                          {Math.floor(chapter.timestamp_seconds / 60)}:{String(chapter.timestamp_seconds % 60).padStart(2, '0')}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{chapter.title}</h3>
                          {chapter.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{chapter.description}</p>}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No chapters available</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Drag handle ── */}
          <div
            onMouseDown={onDragStart}
            className="relative flex items-center justify-center w-3 shrink-0 cursor-col-resize group z-10"
          >
            {/* Invisible wide hit area */}
            <div className="absolute inset-y-0 -left-1 -right-1" />
            {/* Visual line */}
            <div className="w-px h-full bg-gray-200 dark:bg-gray-700 group-hover:bg-indigo-400 dark:group-hover:bg-indigo-500 transition-colors duration-150" />
            {/* Grip dots */}
            <div className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-1 h-1 rounded-full bg-indigo-400 dark:bg-indigo-500" />
              ))}
            </div>
          </div>

          {/* ── Right panel (chat) ── */}
          <div
            className="flex flex-col overflow-hidden"
            style={{ width: `${100 - leftWidthPct}%`, minWidth: 0 }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col h-full overflow-hidden">

              {/* Learn Tab tools */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Zap size={18} className="text-green-500" />
                    Learn Tab
                  </h3>
                  <div className="flex items-center gap-2">
                    <Dropdown
                      options={models}
                      value={selectedModel}
                      onChange={setSelectedModel}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Generate learning materials from this lecture</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: <Music size={14} className="text-purple-500" />, label: 'Podcast' },
                    { icon: <FileText size={14} className="text-blue-500" />, label: 'Summary' },
                    { icon: <HelpCircle size={14} className="text-orange-500" />, label: 'Quiz' },
                    { icon: <BookMarked size={14} className="text-pink-500" />, label: 'Flashcards' },
                  ].map(({ icon, label }) => (
                    <button key={label} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-left">
                      {icon}
                      <span className="text-xs font-medium dark:text-gray-200">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar bg-gray-50/50 dark:bg-gray-950/20">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center opacity-40 text-center py-10">
                    <Zap size={32} className="text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ask anything about this lecture to start learning</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start w-full'} max-w-full`}>
                        {msg.role === 'user' ? (
                          <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-indigo-600 text-white text-sm leading-relaxed max-w-[85%]">
                            {msg.content}
                          </div>
                        ) : (
                          <div className="w-full rounded-2xl rounded-tl-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="px-4 pt-3 pb-2 text-sm text-gray-900 dark:text-white overflow-x-auto">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-gray-800 dark:text-gray-200">{children}</p>,
                                  h1: ({ children }) => <h1 className="text-base font-semibold mt-4 mb-1.5 first:mt-0 text-gray-900 dark:text-white">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-sm font-semibold mt-3 mb-1 first:mt-0 text-gray-900 dark:text-white">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-sm font-medium mt-2 mb-1 first:mt-0 text-gray-900 dark:text-white">{children}</h3>,
                                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5 text-gray-800 dark:text-gray-200">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5 text-gray-800 dark:text-gray-200">{children}</ol>,
                                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                  code: ({ className, children, ...rest }: any) => {
                                    const isBlock = /language-(\w+)/.exec(className || '');
                                    return isBlock ? (
                                      <code className={className} {...rest}>{children}</code>
                                    ) : (
                                      <code className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                                    );
                                  },
                                  pre: ({ children }) => (
                                    <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono leading-relaxed">{children}</pre>
                                  ),
                                  blockquote: ({ children }) => (
                                    <blockquote className="border-l-2 border-indigo-300 dark:border-indigo-600 pl-3 my-2 italic text-gray-600 dark:text-gray-400">{children}</blockquote>
                                  ),
                                  hr: () => <hr className="my-3 border-gray-100 dark:border-gray-700" />,
                                  table: ({ children }) => (
                                    <div className="w-full overflow-x-auto my-2 rounded-lg border border-gray-100 dark:border-gray-700">
                                      <table className="w-full text-xs border-collapse">{children}</table>
                                    </div>
                                  ),
                                  thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-700/60">{children}</thead>,
                                  tbody: ({ children }) => <tbody className="divide-y divide-gray-100 dark:divide-gray-700">{children}</tbody>,
                                  th: ({ children }) => <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{children}</th>,
                                  td: ({ children }) => <td className="px-3 py-2 text-gray-700 dark:text-gray-300 align-top">{children}</td>,
                                  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{children}</a>,
                                  strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                                  em: ({ children }) => <em className="italic text-gray-700 dark:text-gray-300">{children}</em>,
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                        {msg.timestamp && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1 mt-0.5">
                            {formatTimestamp(msg.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {isSending && (
                  <div className="flex gap-2 justify-start">
                    <div className="shrink-0 w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <Bot size={14} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-700 shadow-sm flex gap-1.5 items-center">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask a question..."
                    disabled={isSending}
                    className="flex-1 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isSending || !inputMessage.trim()}
                    className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md shadow-indigo-200 dark:shadow-none"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile: full stacked layout ── */}
        <div className="flex lg:hidden flex-col gap-4 max-w-7xl mx-auto overflow-y-auto pb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{content.title}</h1>

          {/* Video */}
          {content.videoUrl ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
              {!!videoUrl() ? (
                <iframe src={videoUrl()} title={content.title} className="w-full h-full" allowFullScreen />
              ) : (
                <video ref={videoRef} src={content.videoUrl} title={content.title} className="w-full h-full" controls />
              )}
            </div>
          ) : (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <p className="text-gray-400">No video available</p>
            </div>
          )}

          {/* Transcripts / Chapters tabs */}
          <div>
            <div className="flex gap-4 mb-3 border-b border-gray-200 dark:border-gray-800">
              {(['transcripts', 'chapters'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium border-b-2 capitalize transition ${activeTab === tab
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'transcripts' && (
              <div className='p-3 rounded-lg dark:bg-gray-900 flex-1 flex flex-col min-h-0'>
                <div className="space-y-3 max-h-72 overflow-y-auto no-scrollbar">
                  {transcripts.length > 0 ? transcripts.map((transcript) => {
                    const originalIndex = transcripts.findIndex(t => t._id === transcript._id);
                    return (
                      <div
                        key={transcript._id}
                        id={`transcript-mobile-${originalIndex}`}
                        className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border transition-all ${activeIndex === originalIndex
                          ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                          : 'border-gray-200 dark:border-gray-700'
                          }`}
                      >
                        {transcript.start !== null && transcript.end !== null && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-mono">
                            {formatTime(transcript.start)} - {formatTime(transcript.end)}
                          </p>
                        )}
                        <p className="text-gray-900 dark:text-white text-sm leading-relaxed">{transcript.text}</p>
                      </div>
                    );
                  }) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-6">No transcripts available</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'chapters' && (
              <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                {chapters.length > 0 ? chapters.map((chapter) => (
                  <div key={chapter.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 cursor-pointer transition">
                    <div className="flex items-start gap-3">
                      <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                        {Math.floor(chapter.timestamp_seconds / 60)}:{String(chapter.timestamp_seconds % 60).padStart(2, '0')}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{chapter.title}</h3>
                        {chapter.description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{chapter.description}</p>}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-6">No chapters available</p>
                )}
              </div>
            )}
          </div>

          {/* Learn Tab tools */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap size={18} className="text-green-500" />
                Learn Tab
              </h3>
              <div className="flex items-center gap-2">
                <Dropdown
                  options={models}
                  value={selectedModel}
                  onChange={setSelectedModel}
                />
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Generate learning materials from this lecture</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: <Music size={14} className="text-purple-500" />, label: 'Podcast' },
                { icon: <FileText size={14} className="text-blue-500" />, label: 'Summary' },
                { icon: <HelpCircle size={14} className="text-orange-500" />, label: 'Quiz' },
                { icon: <BookMarked size={14} className="text-pink-500" />, label: 'Flashcards' },
              ].map(({ icon, label }) => (
                <button key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  {icon}
                  <span className="text-[10px] font-medium dark:text-gray-200">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[500px] overflow-y-auto" style={{ minHeight: '420px' }}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-gray-50/50 dark:bg-gray-950/20">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 opacity-40 text-center">
                  <Zap size={28} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ask anything about this lecture</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start w-full'} max-w-full`}>
                      {msg.role === 'user' ? (
                        <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-indigo-600 text-white text-sm leading-relaxed max-w-[85%]">
                          {msg.content}
                        </div>
                      ) : (
                        <div className="w-full rounded-2xl rounded-tl-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                          <div className="px-4 pt-3 pb-2 text-sm overflow-x-auto">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-gray-800 dark:text-gray-200">{children}</p>,
                                h1: ({ children }) => <h1 className="text-base font-semibold mt-4 mb-1.5 first:mt-0 text-gray-900 dark:text-white">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-sm font-semibold mt-3 mb-1 first:mt-0 text-gray-900 dark:text-white">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-medium mt-2 mb-1 first:mt-0 text-gray-900 dark:text-white">{children}</h3>,
                                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5 text-gray-800 dark:text-gray-200">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5 text-gray-800 dark:text-gray-200">{children}</ol>,
                                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                code: ({ className, children, ...rest }: any) => {
                                  const isBlock = /language-(\w+)/.exec(className || '');
                                  return isBlock
                                    ? <code className={className} {...rest}>{children}</code>
                                    : <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>;
                                },
                                pre: ({ children }) => <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono">{children}</pre>,
                                table: ({ children }) => (
                                  <div className="w-full overflow-x-auto my-2 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <table className="w-full text-xs border-collapse">{children}</table>
                                  </div>
                                ),
                                thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-700/60">{children}</thead>,
                                tbody: ({ children }) => <tbody className="divide-y divide-gray-100 dark:divide-gray-700">{children}</tbody>,
                                th: ({ children }) => <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{children}</th>,
                                td: ({ children }) => <td className="px-3 py-2 text-gray-700 dark:text-gray-300 align-top">{children}</td>,
                                strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                      {msg.timestamp && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1 mt-0.5">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isSending && (
                <div className="flex gap-2 justify-start">
                  <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask a question..."
                  disabled={isSending}
                  className="flex-1 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || !inputMessage.trim()}
                  className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}