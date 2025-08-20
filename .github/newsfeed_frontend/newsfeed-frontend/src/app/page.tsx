import Header from './components/Header';
import NewsfeedList from './components/NewsfeedList';
import CreatePostForm from './components/CreatePostForm';
import UserSection from './components/UserSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-8">
            <NewsfeedList />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="space-y-4">
              {/* Create Post Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Create a Post
                </h2>
                <CreatePostForm />
              </div>

              {/* User Section */}
              <UserSection />

              {/* About Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  About Newsfeed
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Welcome to Newsfeed! This is your source for the latest updates and discussions.
                  Join our community to share and discover interesting content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
