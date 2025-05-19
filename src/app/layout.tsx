import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme/theme-provider';
import './globals.css'
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RateMyCourse - IIT Bhilai',
  description: 'Find and review courses and professors at IIT Bhilai',
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
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </ThemeProvider>
      </AuthProvider>
      </body>
    </html>
  );
}