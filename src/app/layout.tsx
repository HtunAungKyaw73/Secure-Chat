import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeChat",
  description: "A real-time, premium chat application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-violet-500/30`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="fixed inset-0 bg-glow-mesh -z-10 pointer-events-none opacity-50 dark:opacity-100" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
