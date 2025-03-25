"use client"

import React from "react"
import { AuthProvider } from "@/hooks/use-auth"
// Import any other providers you need

export default function ClientAuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* Nest other context providers here that depend on auth */}
      {children}
    </AuthProvider>
  )
} 