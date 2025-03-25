"use client"

import { useState } from "react"
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ExtendedUser {
  displayName?: string;
  permanentQrCodeUrl?: string;
}

export default function ClientQrPage() {
  const { user } = useAuth() as { user: ExtendedUser | null };
  const [loading, setLoading] = useState(false)

  if (!user) {
    return null // Will be handled by middleware
  }

  const handleRefreshQr = () => {
    setLoading(true)
    // In a real implementation, this would call an API to regenerate the QR code
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/client" className="flex items-center text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Your Permanent QR Code</h1>
        <p className="text-muted-foreground">Use this QR code for entry to your properties</p>
      </div>

      <div className="flex justify-center">
        <Card className="glass-card max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Site Access QR Code</CardTitle>
            <CardDescription>Show this QR code at the site entrance for all your properties</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg mb-4">
              <Image
                src={user.permanentQrCodeUrl || "/placeholder.svg?height=300&width=300"}
                alt="Permanent QR Code"
                width={250}
                height={250}
                className="mx-auto"
              />
            </div>

            <div className="w-full space-y-4">
              <div className="bg-background/50 backdrop-blur-sm rounded-md p-3">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user.displayName}</p>
              </div>

              <div className="bg-background/50 backdrop-blur-sm rounded-md p-3">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium text-green-600 dark:text-green-400">Active</p>
              </div>

              <div className="bg-background/50 backdrop-blur-sm rounded-md p-3">
                <p className="text-sm text-muted-foreground">Valid For</p>
                <p className="font-medium">All Your Properties</p>
              </div>
            </div>

            <div className="mt-6 w-full">
              <Button variant="outline" className="w-full glass-button" onClick={handleRefreshQr} disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                    Refreshing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh QR Code
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-md mx-auto">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-md p-4">
              <h3 className="font-medium text-amber-800 dark:text-amber-300 mb-2">Usage Guidelines:</h3>
              <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-400 text-sm">
                <li>This QR code is linked to your identity</li>
                <li>It provides access to all properties you own</li>
                <li>Do not share this QR code with others</li>
                <li>For visitors, generate a temporary visitor pass instead</li>
                <li>If your QR code is compromised, use the refresh button</li>
              </ul>
            </div>

            <Link href="/dashboard/client/visitor-qr">
              <Button className="w-full">
                <QrCode className="mr-2 h-4 w-4" />
                Generate Visitor Pass
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


