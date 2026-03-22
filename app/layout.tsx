import './globals.css';

import type { Metadata } from 'next';
import { DM_Serif_Display, Geist, Geist_Mono } from 'next/font/google';

import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: '--font-dm-serif-display',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Bob the Builder',
  description: 'A builder community platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSerifDisplay.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
