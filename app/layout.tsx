import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from "next";
import { Inter, Barlow } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const interFont = Inter({subsets: ['latin']})
const barlowFont = Inter({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: "--font-barlow"
})

export const metadata: Metadata = {
  title: "GoShop",
  description: "Welcome to GoShop, your ultimate destination for seamless online shopping! Discover a vast a ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${interFont.className} ${barlowFont.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
