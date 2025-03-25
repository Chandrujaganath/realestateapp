import React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { AppProviders } from "@/providers/app-providers"
import { BottomNav } from "@/components/common/navigation/bottom-nav"
import { headers } from "next/headers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Real Estate Management System",
  description: "A comprehensive system for managing real estate projects",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const pathname = headersList.get("x-pathname") || ""
  const isNotFoundPage = pathname === "/_not-found"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <main className="flex-1 pb-16">
              {children}
            </main>
            {!isNotFoundPage && <BottomNav />}
          </div>
        </AppProviders>
      </body>
    </html>
  )
}