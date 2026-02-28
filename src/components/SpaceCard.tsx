import { Link } from 'react-router-dom';
import type { Space } from '../lib/types';

type SpaceCardProps = {
  space: Space;
};

export function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Link
      to={`/space/${space._id}`}
      className="group relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br hover:shadow-lg transition">
      <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition" />
      <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
        <h3 className="text-lg font-semibold">{space.name}</h3>
        {space.description && (
          <p className="text-sm text-gray-200 line-clamp-1">
            {space.description}
          </p>
        )}
      </div>
    </Link>
  );
}
