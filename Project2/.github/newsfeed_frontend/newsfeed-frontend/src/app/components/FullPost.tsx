'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      title
      content
      author {
        username
      }
      timestamp
    }
  }
`;

const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $title: String, $content: String) {
    updatePost(id: $id, title: $title, content: $content) {
      id
      title
      content
      author {
        username
      }
    }
  }
`;

interface FullPostProps {
  postId: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
  };
  timestamp: string;
}

export default function FullPost({ postId }: FullPostProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const { loading, error, data } = useQuery<{ post: Post }>(GET_POST, {
    variables: { id: postId },
  });

  const [updatePost, { loading: updating }] = useMutation(UPDATE_POST, {
    refetchQueries: [{ query: GET_POST, variables: { id: postId } }],
  });

  const handleEdit = () => {
    setEditTitle(data?.post.title || '');
    setEditContent(data?.post.content || '');
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) return;

    try {
      await updatePost({
        variables: {
          id: postId,
          title: editTitle.trim(),
          content: editContent.trim(),
        },
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating post:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <p className="text-gray-600 dark:text-gray-300">Error loading post: {error.message}</p>
      </div>
    );
  }

  if (!data?.post) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <p className="text-gray-600 dark:text-gray-300">Post not found</p>
      </div>
    );
  }

  const post = data.post;

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Content
            </label>
            <textarea
              id="content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-4">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Posted by {post.author.username}</span>
            <span>•</span>
            <span>{post.timestamp}</span>
          </div>
          <button
            onClick={handleEdit}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Edit Post
          </button>
        </div>

        {/* Post Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {post.title}
        </h1>

        {/* Post Content */}
        <div className="prose dark:prose-invert max-w-none mb-6">
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      </div>
    </div>
  );
} 