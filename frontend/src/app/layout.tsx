'use client';
import { Inter } from 'next/font/google'
import './globals.css'
import NavBar from '../components/NavBar'
import dynamic from 'next/dynamic';
import { SearchQueryProvider } from '../contexts/SearchQueryContext';
import { ServersDataProvider } from '../contexts/ServersDataContext';

const SelectedFilterProvider = dynamic(() => import('../contexts/SelectedFilterContext').then(mod => mod.SelectedFilterProvider), {
  ssr: false,
});

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 overflow-scroll`} suppressHydrationWarning={true}>
        <ServersDataProvider>
          <SelectedFilterProvider>
            <SearchQueryProvider>
              <NavBar />
              <main className='py-8 px-8 '>
                {children}
              </main>
            </SearchQueryProvider>
          </SelectedFilterProvider>
        </ServersDataProvider>
      </body>
    </html >
  )
}
