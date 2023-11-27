"use client"; // This file is client-side only
import Head from 'next/head';

interface ErrorPageProps {
    error: Error;
}

export default function Error({ error }: ErrorPageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <Head>
        <title>Error</title>
      </Head>
      <h1 className="text-4xl font-bold mb-4">Error</h1>
      <h2 className='text-2xl font-bold mb-4'>{error.message}</h2>
      <p className="text-lg text-gray-600 mb-8">
        Oops! Something went wrong. Please try again later.
      </p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => window.location.reload()}
      >
        Refresh
      </button>
    </div>
  );
};

