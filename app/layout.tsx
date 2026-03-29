import './globals.css';

import type { Metadata } from 'next';
import { Geist_Mono, Montserrat, Plus_Jakarta_Sans } from 'next/font/google';

import { Toaster } from '@/components/ui/sonner';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Plus Jakarta Sans is a variable font (weight axis 200–800).
// Omitting `weight` downloads the single variable font file instead of
// three separate static files, which is smaller and more flexible.
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
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
        className={`${montserrat.variable} ${geistMono.variable} ${plusJakartaSans.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
