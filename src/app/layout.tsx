import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/mecatrix/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mecatrix — AI-Powered Automotive Intelligence",
  description:
    "Mecatrix is a next-generation automotive learning, diagnostic, and repair platform combining AI, immersive 3D engines, and intelligent guidance.",
  keywords: [
    "Mecatrix", "automotive AI", "engine diagnosis", "3D workshop",
    "mechanic training", "MecaAI", "vehicle repair",
  ],
  authors: [{ name: "Mecatrix" }],
  icons: { icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg" },
  openGraph: {
    title: "Mecatrix — AI-Powered Automotive Intelligence",
    description: "Diagnose, learn, and master vehicle systems with AI + immersive 3D.",
    siteName: "Mecatrix",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
