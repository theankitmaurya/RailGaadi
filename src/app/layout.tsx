import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { AIAssistantDrawer } from '@/components/ai/AIAssistantDrawer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RailGaadi — Railway Intelligence & Journey Tracking',
  description:
    'Real-time train tracking, interactive map visualization, route analytics, and AI travel companion for Indian Railways.',
  keywords: 'Indian Railways, train tracking, live status, railway map, train route, journey intelligence',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning>
        <body className="min-h-screen bg-surface-1 text-text-primary flex flex-col font-sans transition-colors duration-300">
          <ThemeProvider>
            <QueryProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <AIAssistantDrawer />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
