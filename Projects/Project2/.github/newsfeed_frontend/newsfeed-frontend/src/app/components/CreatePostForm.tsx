'use client';

import React, { useState } from 'react';
import { useMutation, gql, useQuery } from '@apollo/client';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
    }
  }
`;

const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: String!, $username: String!) {
    createPost(title: $title, content: $content, author_username: $username) {
      id
      title
      author {
        id
        username
      }
    }
  }
`;

export default function CreatePostForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Fetch users with no caching
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USERS, {
    fetchPolicy: 'network-only', // This ensures we always get fresh data
  });

  const [createPost, { loading }] = useMutation(CREATE_POST, {
    refetchQueries: [
      'GetPosts',
      { query: GET_USERS }, // Also refetch users after post creation
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    // Check if we have users
    if (!userData?.users || userData.users.length === 0) {
      alert('No users available in the system. Cannot create post.');
      return;
    }

    // Force a new random selection each time
    const users = [...userData.users];
    const randomIndex = Math.floor(Math.random() * users.length);
    const randomUser = users[randomIndex];

    try {
      await createPost({
        variables: {
          title,
          content,
          username: randomUser.username,
        },
      });
      setTitle('');
      setContent('');
      setIsOpen(false);
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Error creating post. Please try again.');
    }
  };

  // Show loading state while fetching users
  if (userLoading) {
    return <div className="text-center">Loading users...</div>;
  }

  // Show error state if users fetch failed
  if (userError) {
    return <div className="text-center text-red-500">Error loading users. Please refresh the page.</div>;
  }

  // Show disabled state if no users available
  if (!userData?.users || userData.users.length === 0) {
    return (
      <button
        disabled
        className="w-full px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
      >
        Cannot Create Post (No Users Available)
      </button>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Create Post
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          placeholder="What's on your mind?"
          required
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          placeholder="Tell your story..."
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </div>
    </form>
  );
} 