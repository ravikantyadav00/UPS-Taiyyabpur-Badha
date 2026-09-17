import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UPS Taiyyabpur Badha | Official School Website & Mobile App',
  description: 'UPS Taiyyabpur Badha, Nagal, Saharanpur — कक्षा 1 से 8 तक गुणवत्तापूर्ण शिक्षा, स्मार्ट क्लास, कंप्यूटर लैब, पुस्तकालय और डिजिटल विद्यालय प्रबंधन पोर्टल।',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'UPS Badha App',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B1F3A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
