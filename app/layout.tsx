import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cal2Prompt | Content Calendar to AI Prompts',
  description:
    'Internal tool for querying Google Sheet content calendars across multiple product spreadsheets and generating clean, copy-ready Markdown and AI image prompts.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.className}>
      <body
        className={`${dmSans.className} ${dmSans.variable} font-sans bg-[#fcfbfa] text-stone-800 min-h-screen antialiased selection:bg-orange-100 selection:text-orange-900`}
      >
        {children}
      </body>
    </html>
  );
}
