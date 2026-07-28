import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/src/lib/auth";
import { Sidebar } from "@/src/components/sidebar";
import { ThemeProvider } from "@/src/lib/theme-context";
import { SessionProvider } from "@/src/components/session-provider";
import { Toaster } from "react-hot-toast";
import type { ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PetShop - Pet Store Management System",
  description: "A comprehensive pet store management system for inventory, sales, and reporting.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const role = session?.user?.role ?? "ADMIN";

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <SessionProvider session={session}>
          <ThemeProvider>
            {session ? (
              <div className="flex min-h-screen">
                <Sidebar userRole={role} />
                <main className="flex-1 ml-64 p-8 bg-background transition-all duration-300">
                  {children}
                </main>
              </div>
            ) : (
              <>{children}</>
            )}
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}