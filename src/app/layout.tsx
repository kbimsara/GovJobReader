import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Gov Job Tracker",
  description: "Track Sri Lankan Government Vacancies, Examinations and Results",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-gray-900 text-gray-100">
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
          },
        }} />
        {children}
      </body>
    </html>
  );
}
