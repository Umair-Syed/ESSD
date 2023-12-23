'use client';
import { Inter } from 'next/font/google'
import './globals.css'
import NavBar from '../components/NavBar'
import { SelectedFilterProvider } from '../contexts/SelectedFilterContext';
import { SearchQueryProvider } from '../contexts/SearchQueryContext';
import { ServersDataProvider } from '../contexts/ServersDataContext';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ServersDataProvider>
      <SelectedFilterProvider>
        <SearchQueryProvider>
          <html lang="en">
            <body className={`${inter.className} bg-gray-100 overflow-scroll`} suppressHydrationWarning={true}>
              <NavBar />
              <main className='py-8 px-8 '>
                {children}
              </main>
            </body>
          </html>
        </SearchQueryProvider>
      </SelectedFilterProvider>
    </ServersDataProvider>
  )
}
