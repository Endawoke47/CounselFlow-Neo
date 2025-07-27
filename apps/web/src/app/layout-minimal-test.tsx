import type { Metadata } from 'next';
import './globals.css';

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
      <body>
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
