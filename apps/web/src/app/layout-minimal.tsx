import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CounselFlow Ultimate - AI-Powered Legal Practice Management',
  description: 'Transform your legal practice with AI-powered automation, intelligent workflows, and comprehensive matter management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
