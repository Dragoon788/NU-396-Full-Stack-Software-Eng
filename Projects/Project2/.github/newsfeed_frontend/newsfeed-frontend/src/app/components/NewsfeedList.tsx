'use client';

import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import NewsfeedCard from './NewsfeedCard';
import UserFilter from './UserFilter';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
    }
  }
`;

const GET_POSTS = gql`
  query GetPosts {
    posts {
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

const GET_USERS_POSTS = gql`
  query GetUsersPosts($username: String!) {
    getUsersPosts(username: $username) {
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

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
  };
  timestamp: string;
}

interface AllPostsData {
  posts: Post[];
}

interface UserPostsData {
  getUsersPosts: Post[];
}

interface User {
  id: string;
  username: string;
}

interface UsersData {
  users: User[];
}

export default function NewsfeedList() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Query to check if there are any users in the system
  const { data: usersData, loading: usersLoading } = useQuery<UsersData>(GET_USERS, {
    fetchPolicy: 'network-only',
  });

  const allPostsQuery = useQuery<AllPostsData>(GET_POSTS, {
    skip: !!selectedUser,
  });

  const userPostsQuery = useQuery<UserPostsData>(GET_USERS_POSTS, {
    variables: { username: selectedUser || '' },
    skip: !selectedUser,
  });

  // Determine which query results to use
  const { loading, error, data } = selectedUser ? userPostsQuery : allPostsQuery;

  // Get the posts array from the appropriate query result
  const posts = selectedUser && data 
    ? (data as UserPostsData).getUsersPosts 
    : !selectedUser && data 
      ? (data as AllPostsData).posts 
      : [];

  // Loading state while checking users or posts
  if (loading || usersLoading) {
    return (
      <div>
        <UserFilter selectedUser={selectedUser} onUserSelect={setSelectedUser} />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <UserFilter selectedUser={selectedUser} onUserSelect={setSelectedUser} />
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-200">Error loading posts: {error.message}</p>
        </div>
      </div>
    );
  }

  // Check if there are any users in the system
  const hasUsers = usersData?.users && usersData.users.length > 0;

  return (
    <div>
      <UserFilter selectedUser={selectedUser} onUserSelect={setSelectedUser} />
      <div className="space-y-4">
        {posts.map((post: Post) => (
          <NewsfeedCard
            key={post.id}
            id={post.id}
            title={post.title}
            description={post.content}
            author={post.author}
            timestamp={post.timestamp}
          />
        ))}
        {(!hasUsers || posts.length === 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {!hasUsers 
                ? "No users have been created yet. Create a user to start posting!"
                : selectedUser 
                  ? `No posts found for user ${selectedUser}` 
                  : 'No posts found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 