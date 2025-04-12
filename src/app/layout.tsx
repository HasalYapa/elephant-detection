import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CiviWise - Smart Civil Engineering Platform",
  description: "A civil engineering web platform for site analysis and design aid in Sri Lanka",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <Navbar />
        <main>
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-4 mt-12">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm">© 2025 CiviWise - Smart Civil Engineering Platform for Sri Lanka</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
