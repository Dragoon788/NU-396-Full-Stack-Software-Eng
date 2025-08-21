'use client';

import Link from 'next/link';

interface NewsfeedCardProps {
  id: string;
  title: string;
  description: string;
  author: {
    username: string;
  };
  timestamp: string;
}

export default function NewsfeedCard({
  id,
  title,
  description,
  author,
  timestamp,
}: NewsfeedCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <Link href={`/post/${id}`}>
        <div className="p-4 cursor-pointer">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Posted by {author.username}</span>
            <span>•</span>
            <span>{timestamp}</span>
          </div>
          
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
            {description}
          </p>
        </div>
      </Link>
    </div>
  );
} 