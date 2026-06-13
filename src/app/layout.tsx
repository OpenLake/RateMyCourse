import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme/theme-provider';
import './globals.css'
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/layout/ScrollToTop';
import PageTransition from '@/components/layout/PageTransition';
import ServiceWorkerRegister from '@/components/layout/ServiceWorkerRegister';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RateMyCourse - IIT Bhilai',
  description: 'Find and review courses and professors at IIT Bhilai',
  manifest: '/manifest.json',
  themeColor: '#7c3aed',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col">
              <ScrollToTop />
              <Header />
              <div className="flex-1">
                <PageTransition>{children}</PageTransition>
              </div>
              <Footer />
            </div>
            {/* Toast notifications */}
            <Toaster position="top-center" />
            <ServiceWorkerRegister />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
