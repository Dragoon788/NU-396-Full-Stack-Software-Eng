'use client';

import React from 'react';

interface CommentType {
  id: string;
  content: string;
  author: {
    username: string;
  };
  created_at: string;
}

interface CommentProps {
  comment: CommentType;
}

export default function Comment({ comment }: CommentProps): React.ReactNode {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      {/* Comment Header */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
        <span className="font-medium">{comment.author.username}</span>
        <span>•</span>
        <span>{comment.created_at}</span>
      </div>

      {/* Comment Content */}
      <p className="text-gray-700 dark:text-gray-300">
        {comment.content}
      </p>
    </div>
  );
} 