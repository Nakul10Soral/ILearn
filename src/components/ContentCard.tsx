import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import type { ContentItem } from '../lib/types';
import { formatDate } from '../lib/utils';

type ContentCardProps = {
  content: ContentItem;
};

export function ContentCard({ content }: ContentCardProps) {
  return (
    <Link
      to={`/content/${content._id}`}
      className="group relative rounded-lg overflow-hidden bg-gray-900 aspect-video hover:shadow-lg transition"
    >
      {content.videoUrl ? (
        <video
          src={content.videoUrl}
          title={content.title}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
      )}

      <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition" />

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
        <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center">
          <Play size={28} className="text-gray-900 ml-1" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
        <h3 className="text-white font-semibold line-clamp-2 text-sm">
          {content.title}
        </h3>
        <p className="text-gray-300 text-xs mt-1">
          {formatDate(new Date(content.createdAt))}
        </p>
      </div>
    </Link>
  );
}
