import React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { AppProviders } from "@/providers/app-providers"
import { BottomNavWrapper } from "@/components/common/navigation/bottom-nav-wrapper"
import { headers } from "next/headers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Real Estate Management System",
  description: "A comprehensive system for managing real estate projects",
  generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <main className="flex-1 pb-16">
              {children}
            </main>
            <BottomNavWrapper />
          </div>
        </AppProviders>
      </body>
    </html>
  )
}