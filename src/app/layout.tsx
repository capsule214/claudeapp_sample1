import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppThemeProvider from "@/components/AppThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "メモボード",
  description: "Next.js + MUI メモボードアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
