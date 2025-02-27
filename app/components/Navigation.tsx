import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-bold text-xl text-blue-600">
                FlashLearn
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="/create"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Create
              </Link>
              <Link
                href="/review"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Review
              </Link>
              <Link
                href="/manage"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Manage
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="sm:hidden border-t">
        <div className="grid grid-cols-4 text-center">
          <Link
            href="/"
            className="text-gray-500 py-2 hover:bg-gray-50"
          >
            Home
          </Link>
          <Link
            href="/create"
            className="text-gray-500 py-2 hover:bg-gray-50"
          >
            Create
          </Link>
          <Link
            href="/review"
            className="text-gray-500 py-2 hover:bg-gray-50"
          >
            Review
          </Link>
          <Link
            href="/manage"
            className="text-gray-500 py-2 hover:bg-gray-50"
          >
            Manage
          </Link>
        </div>
      </div>
    </nav>
  );
} 