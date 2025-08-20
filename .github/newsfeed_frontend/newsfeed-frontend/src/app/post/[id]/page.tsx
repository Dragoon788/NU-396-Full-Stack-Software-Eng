import React from 'react';
import Header from '../../components/Header';
import FullPost from '../../components/FullPost';
import CommentSection from '../../components/CommentSection';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function PostPage({ params }: PageProps) {
  const parameters = await params
  const postId = parameters.id;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-8">
            <FullPost postId={postId} />
            <CommentSection postId={postId} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-24">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Community Guidelines
              </h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Be respectful and constructive in your comments</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>No spam or self-promotion</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Stay on topic and contribute meaningfully</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}