'use client'

import { ThemeProvider } from "next-themes"
import Header from "@/components/dashboard/header"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function DetectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="bg-card border-b border-border px-6 py-2">
            <Link 
              href="/dashboard" 
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={16} className="mr-1" />
              Back to Dashboard
            </Link>
          </div>
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
} 