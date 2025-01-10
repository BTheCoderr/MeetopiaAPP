import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Meetopia',
  description: 'Connect and share through video',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link href={session ? "/dashboard" : "/"} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <span className="text-xl font-bold">
                  <span className="text-blue-500">Meet</span>
                  <span className="text-gray-700">opia</span>
                </span>
              </Link>
              
              <div className="flex items-center space-x-4">
                {session ? (
                  <>
                    <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/api/auth/signout" className="text-gray-600 hover:text-gray-900 transition-colors">
                      Sign Out
                    </Link>
                  </>
                ) : (
                  <Link href="/api/auth/signin" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
