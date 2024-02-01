'use client';
import { Inter } from 'next/font/google'
import './globals.css'
import NavBar from '../components/NavBar'
import dynamic from 'next/dynamic';
import { SearchQueryProvider } from '../contexts/SearchQueryContext';
import { ServersDataProvider } from '../contexts/ServersDataContext';
import Script from 'next/script';

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
      <head>
        <title>Edge Servers Dashboard</title>
      </head>
      <body className={`${inter.className} bg-gray-100 overflow-scroll`} suppressHydrationWarning={true}>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-1GF50S0J90"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-1GF50S0J90');
          `}
        </Script>
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
