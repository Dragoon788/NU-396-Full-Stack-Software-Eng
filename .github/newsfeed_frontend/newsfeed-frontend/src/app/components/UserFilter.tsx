'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
    }
  }
`;

interface UserFilterProps {
  selectedUser: string | null;
  onUserSelect: (username: string | null) => void;
}

export default function UserFilter({ selectedUser, onUserSelect }: UserFilterProps) {
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USERS, {
    fetchPolicy: 'network-only',
  });

  if (userLoading) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="w-full bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <p className="text-red-600 dark:text-red-200">Error loading users: {userError.message}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center space-x-4">
        <label className="text-gray-700 dark:text-gray-300 font-medium">Filter by User:</label>
        <select
          value={selectedUser || ''}
          onChange={(e) => onUserSelect(e.target.value || null)}
          className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="">All Posts</option>
          {userData?.users?.map((user) => (
            <option key={user.id} value={user.username}>
              {user.username}
            </option>
          ))}
        </select>
        {selectedUser && (
          <button
            onClick={() => onUserSelect(null)}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear Filter
          </button>
        )}
      </div>
    </div>
  );
} 