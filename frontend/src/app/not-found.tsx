import Link from 'next/link';

export default function NotFound(){
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <h2 className="text-2xl font-medium text-gray-600">Page Not Found</h2>
      <p className="text-gray-500">The page you are looking for does not exist.</p>
      <Link href="/" className="mt-4 text-blue-500 hover:underline">
        Go back to home
      </Link>
    </div>
  );
};
