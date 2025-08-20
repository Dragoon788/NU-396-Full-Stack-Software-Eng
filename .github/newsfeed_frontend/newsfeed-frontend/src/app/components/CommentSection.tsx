'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import Comment from './Comment';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
    }
  }
`;

const GET_POST_COMMENTS = gql`
  query GetPostComments($postId: ID!) {
    postComments(postID: $postId) {
      id
      content
      author {
        username
      }
      created_at
    }
  }
`;

const CREATE_COMMENT = gql`
  mutation CreateComment($postId: ID!, $content: String!, $username: String!) {
    addComment(postID: $postId, content: $content, author_username: $username) {
      id
      content
      author {
        username
      }
      created_at
    }
  }
`;

interface CommentSectionProps {
  postId: string;
}

interface CommentType {
  id: string;
  content: string;
  author: {
    username: string;
  };
  created_at: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  
  // Fetch users with no caching
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USERS, {
    fetchPolicy: 'network-only', // This ensures we always get fresh data
  });
  
  const { data, loading, error } = useQuery<{ postComments: CommentType[] }>(GET_POST_COMMENTS, {
    variables: { postId },
  });

  const [createComment] = useMutation(CREATE_COMMENT, {
    refetchQueries: [
      { query: GET_POST_COMMENTS, variables: { postId } },
      { query: GET_USERS }, // Also refetch users after comment creation
    ],
  });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Check if we have users
    if (!userData?.users || userData.users.length === 0) {
      alert('No users available in the system. Cannot create comment.');
      return;
    }

    // Force a new random selection each time
    const users = [...userData.users];
    const randomIndex = Math.floor(Math.random() * users.length);
    const randomUser = users[randomIndex];

    try {
      await createComment({
        variables: {
          postId,
          content: newComment,
          username: randomUser.username,
        },
      });
      setNewComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Error posting comment. Please try again.');
    }
  };

  // Show loading state while fetching data
  if (loading || userLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  // Show error state
  if (error || userError) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-200">
          Error loading data: {error?.message || userError?.message}
        </p>
      </div>
    );
  }

  // Show disabled state if no users available
  const noUsersAvailable = !userData?.users || userData.users.length === 0;

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {noUsersAvailable ? (
              <span className="text-red-500">No users available to comment</span>
            ) : (
              <span>Comment will be posted as a random user</span>
            )}
          </p>
        </div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={noUsersAvailable ? "Commenting is disabled - no users available" : "What are your thoughts?"}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          rows={4}
          disabled={noUsersAvailable}
        />
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={!newComment.trim() || noUsersAvailable}
          >
            Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {data?.postComments?.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
} 