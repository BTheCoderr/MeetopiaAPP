import { getServerSession } from "next-auth/next";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-800">
                Meetopia
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {session?.user?.email}
              </span>
              <Link
                href="/api/auth/signout"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
} 