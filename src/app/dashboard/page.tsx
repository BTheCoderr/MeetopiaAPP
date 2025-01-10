import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Video Feed Section */}
          <Link href="/videos" 
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 text-center cursor-pointer">
            <div className="h-24 w-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Video Feed</h2>
            <p className="text-gray-600">Browse and watch community videos</p>
          </Link>

          {/* Video Chat Section */}
          <Link href="/chat/video" 
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 text-center cursor-pointer">
            <div className="h-24 w-24 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Video Chat</h2>
            <p className="text-gray-600">Meet and chat with others via video</p>
          </Link>

          {/* Upload Video Section */}
          <Link href="/chat/upload" 
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 text-center cursor-pointer">
            <div className="h-24 w-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Upload Video</h2>
            <p className="text-gray-600">Share your content with others</p>
          </Link>

          {/* Live Stream Section */}
          <Link href="/chat/stream" 
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 text-center cursor-pointer">
            <div className="h-24 w-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Go Live</h2>
            <p className="text-gray-600">Start streaming to your audience</p>
          </Link>

          {/* Chat Room Section */}
          <Link href="/chat/combined" 
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 text-center cursor-pointer">
            <div className="h-24 w-24 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Chat Room</h2>
            <p className="text-gray-600">Join live conversations</p>
          </Link>

          {/* Profile Section */}
          <Link href="/profile" 
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 text-center cursor-pointer">
            <div className="h-24 w-24 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Profile</h2>
            <p className="text-gray-600">Manage your account settings</p>
          </Link>

          {/* Settings Section */}
          <Link href="/settings" 
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 text-center cursor-pointer">
            <div className="h-24 w-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Settings</h2>
            <p className="text-gray-600">Configure your preferences</p>
          </Link>
        </div>
      </main>
    </div>
  );
} 