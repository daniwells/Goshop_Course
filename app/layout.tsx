// Next
import type { Metadata } from "next";
import { Inter, Barlow } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

// Clerk
import { ClerkProvider } from '@clerk/nextjs'

// Shadcn
import { Toaster } from "@/components/ui/sonner";

// Provider
import ModalProvider from "@/providers/modal-provider";

const interFont = Inter({subsets: ['latin']})
const barlowFont = Barlow({
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
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" suppressHydrationWarning>
        <body
          suppressHydrationWarning
          className={`${interFont.className} ${barlowFont.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ModalProvider>
              {children}
            </ModalProvider>
            <Toaster richColors/>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}