import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientAuthProvider } from '@/components/client-auth-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CounselFlow Ultimate',
  description: 'AI-Powered Legal Practice Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientAuthProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </ClientAuthProvider>
      </body>
    </html>
  );
}
