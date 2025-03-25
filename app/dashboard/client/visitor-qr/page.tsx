"use client"

import { useState, useEffect } from "react"
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QrCode, ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import type { Plot } from "@/contexts/auth-context"

export default function VisitorQrPage() {
  const { user, getUserOwnedPlots, generateVisitorQr, hasActiveVisitorQr } = useAuth() as {
    user: any;
    getUserOwnedPlots: () => Promise<Plot[]>;
    generateVisitorQr: (visitorName: string, visitorEmail: string, visitDate: Date, plotId: string) => Promise<string>;
    hasActiveVisitorQr: () => Promise<boolean>;
  };
  
  const [loading, setLoading] = useState(false)
  const [ownedPlots, setOwnedPlots] = useState<Plot[]>([])
  const [visitorName, setVisitorName] = useState("")
  const [visitorEmail, setVisitorEmail] = useState("")
  const [visitDate, setVisitDate] = useState<Date | undefined>(undefined)
  const [selectedPlotId, setSelectedPlotId] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [hasActiveQr, setHasActiveQr] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkActiveQr = async () => {
      const hasActive = await hasActiveVisitorQr()
      setHasActiveQr(hasActive)
    }

    const fetchPlots = async () => {
      const plots = await getUserOwnedPlots()
      setOwnedPlots(plots)
      if (plots.length > 0) {
        setSelectedPlotId(plots[0].id)
      }
    }

    checkActiveQr()
    fetchPlots()
  }, [getUserOwnedPlots, hasActiveVisitorQr])

  const handleGenerateQr = async () => {
    if (!visitorName || !visitorEmail || !visitDate || !selectedPlotId) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const qrUrl = await generateVisitorQr(visitorName, visitorEmail, visitDate, selectedPlotId)
      setQrCodeUrl(qrUrl)
      setHasActiveQr(true)
    } catch (err: any) {
      setError(err.message || "Failed to generate visitor QR code")
    } finally {
      setLoading(false)
    }
  }

  if (qrCodeUrl) {
    return (
      <div className="space-y-8">
        <div>
          <Link href="/dashboard/client" className="flex items-center text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Visitor Pass Generated</h1>
          <p className="text-muted-foreground">Share this QR code with your visitor for site access</p>
        </div>

        <div className="flex justify-center">
          <Card className="glass-card max-w-md w-full">
            <CardHeader className="text-center">
              <CardTitle>Visitor QR Code</CardTitle>
              <CardDescription>Valid for one-time use on the selected date</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg mb-4">
                <Image
                  src={qrCodeUrl || "/placeholder.svg"}
                  alt="Visitor QR Code"
                  width={250}
                  height={250}
                  className="mx-auto"
                />
              </div>

              <div className="w-full space-y-4">
                <div className="bg-background/50 backdrop-blur-sm rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Visitor</p>
                  <p className="font-medium">{visitorName}</p>
                </div>

                <div className="bg-background/50 backdrop-blur-sm rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Visit Date</p>
                  <p className="font-medium">{format(visitDate!, "PPP")}</p>
                </div>

                <div className="bg-background/50 backdrop-blur-sm rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Property</p>
                  <p className="font-medium">
                    {ownedPlots.find((plot) => plot.id === selectedPlotId)?.projectName} - Plot{" "}
                    {ownedPlots.find((plot) => plot.id === selectedPlotId)?.number}
                  </p>
                </div>
              </div>

              <div className="mt-6 w-full">
                <Link href="/dashboard/client">
                  <Button className="w-full">Return to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/client" className="flex items-center text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Generate Visitor Pass</h1>
        <p className="text-muted-foreground">Create a temporary QR code for a visitor to access your property</p>
      </div>

      {hasActiveQr ? (
        <Card className="glass-card max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-4 mb-4">
              <QrCode className="h-12 w-12 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Active Visitor Pass</h2>
            <p className="text-center text-muted-foreground mb-6">
              You already have an active visitor pass. Only one visitor pass can be active at a time.
            </p>
            <Button variant="outline" className="glass-button" onClick={() => setHasActiveQr(false)}>
              Generate New Pass (Deactivates Current)
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Visitor Information</CardTitle>
            <CardDescription>Enter details for your visitor's temporary access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-3 text-red-800 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="visitorName">Visitor Name</Label>
              <Input
                id="visitorName"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="Enter visitor's name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitorEmail">Visitor Email</Label>
              <Input
                id="visitorEmail"
                type="email"
                value={visitorEmail}
                onChange={(e) => setVisitorEmail(e.target.value)}
                placeholder="Enter visitor's email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Visit Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal glass-button",
                      !visitDate && "text-muted-foreground",
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {visitDate ? format(visitDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={visitDate}
                    onSelect={setVisitDate}
                    initialFocus
                    disabled={
                      (date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0)) || // Disable past dates
                        date > new Date(new Date().setMonth(new Date().getMonth() + 1)) // Allow booking up to 1 month ahead
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property">Select Property</Label>
              <Select value={selectedPlotId} onValueChange={setSelectedPlotId}>
                <SelectTrigger className="glass-button">
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {ownedPlots.map((plot) => (
                    <SelectItem key={plot.id} value={plot.id}>
                      {plot.projectName} - Plot {plot.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full mt-4"
              disabled={!visitorName || !visitorEmail || !visitDate || !selectedPlotId || loading}
              onClick={handleGenerateQr}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  Generate Visitor Pass
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="max-w-md mx-auto">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Visitor Pass Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Important Notes:</h3>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400 text-sm">
                <li>Visitor passes are valid for one day only</li>
                <li>Only one visitor pass can be active at a time</li>
                <li>The visitor must present the QR code at the site entrance</li>
                <li>The pass will be deactivated after use</li>
                <li>For your own access, use your permanent QR code</li>
              </ul>
            </div>

            <Link href="/dashboard/client/qr">
              <Button variant="outline" className="w-full glass-button">
                View My Permanent QR Code
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


