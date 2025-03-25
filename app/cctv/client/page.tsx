"use client"

import { useState, useEffect } from "react"
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Building2, Maximize2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Plot } from "@/contexts/auth-context"

export default function ClientCctvPage() {
  const { user, getUserOwnedPlots } = useAuth()
  const [ownedPlots, setOwnedPlots] = useState<Plot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        const plots = await getUserOwnedPlots()
        setOwnedPlots(plots)
      } catch (error) {
        console.error("Error fetching plots:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlots()
  }, [getUserOwnedPlots])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
        <h1 className="text-3xl font-bold mb-2">CCTV Monitoring</h1>
        <p className="text-muted-foreground">Access live camera feeds for your properties</p>
      </div>

      {ownedPlots.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Camera className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">You don't own any properties with CCTV access</p>
            <Link href="/dashboard/client">
              <Button>Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {ownedPlots.map((plot) => (
            <Card key={plot.id} className="glass-card overflow-hidden">
              <div className="relative">
                <div className="relative h-48 md:h-64">
                  <Image
                    src={`/placeholder.svg?height=400&width=600&text=${encodeURIComponent(`CCTV Feed - ${plot.projectName} Plot ${plot.number}`)}`}
                    alt={`CCTV Feed - ${plot.projectName}`}
                    fill
                    className="object-cover"
                  />

                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-medium">Live</span>
                  </div>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>
                      {plot.projectName} - Plot {plot.number}
                    </CardTitle>
                    <CardDescription>{plot.location}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <Link href={`/cctv/client/${plot.id}`}>
                    <Button variant="outline" className="glass-button">
                      View Full Screen
                    </Button>
                  </Link>

                  <Link href={`/plot/${plot.id}`}>
                    <Button variant="outline" className="glass-button">
                      <Building2 className="mr-2 h-4 w-4" />
                      View Property
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Main Entrance Camera */}
          <Card className="glass-card overflow-hidden">
            <div className="relative">
              <div className="relative h-48 md:h-64">
                <Image
                  src="/placeholder.svg?height=400&width=600&text=Main%20Entrance%20CCTV"
                  alt="Main Entrance CCTV"
                  fill
                  className="object-cover"
                />

                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium">Live</span>
                </div>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Main Entrance</CardTitle>
                  <CardDescription>Project entrance and security gate</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <Link href="/cctv/client/entrance">
                  <Button variant="outline" className="glass-button">
                    View Full Screen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>CCTV Access Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Important Notes:</h3>
            <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400 text-sm">
              <li>CCTV feeds are available for all properties you own</li>
              <li>The main entrance camera is accessible to all property owners</li>
              <li>Feeds are live and not recorded on your device</li>
              <li>For security reasons, do not share your CCTV access</li>
              <li>Report any issues with the feeds to the property management</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


