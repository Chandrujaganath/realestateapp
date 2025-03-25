"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Calendar, QrCode, Camera } from "lucide-react"
import Link from "next/link"
import type { Plot } from "@/contexts/auth-context"
import { UserAnnouncements } from "@/components/announcements/user-announcements"
import { ImportantAnnouncementBanner } from "@/components/announcements/important-announcement-banner"

export default function ClientDashboard() {
  const { user, getUserOwnedPlots } = useAuth()
  const [ownedPlots, setOwnedPlots] = useState<Plot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        if (getUserOwnedPlots) {
          const plots = await getUserOwnedPlots()
          setOwnedPlots(plots)
        } else {
          // Handle the case where the function doesn't exist
          console.warn("getUserOwnedPlots function is not available")
          setOwnedPlots([])
        }
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
      <ImportantAnnouncementBanner />
      
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.displayName || "Client"}</h1>
        <p className="text-muted-foreground">Manage your properties and access site features</p>
      </div>

      <UserAnnouncements />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              My Properties
            </CardTitle>
            <CardDescription>Your owned plots</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{ownedPlots.length}</p>
            <div className="mt-4">
              <Link href="/plot/my-plots">
                <Button variant="outline" className="w-full glass-button">
                  View My Plots
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Access QR
            </CardTitle>
            <CardDescription>Your permanent site access</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              <span className="text-green-500">Active</span>
            </p>
            <div className="mt-4">
              <Link href="/dashboard/client/qr">
                <Button variant="outline" className="w-full glass-button">
                  View QR Code
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Visitor Pass
            </CardTitle>
            <CardDescription>Generate temporary access</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              <span className="text-amber-500">Not Active</span>
            </p>
            <div className="mt-4">
              <Link href="/dashboard/client/visitor-qr">
                <Button variant="outline" className="w-full glass-button">
                  Generate Pass
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              CCTV Access
            </CardTitle>
            <CardDescription>View your property cameras</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{ownedPlots.length > 0 ? ownedPlots.length : "No"} Feeds</p>
            <div className="mt-4">
              <Link href="/cctv/client">
                <Button variant="outline" className="w-full glass-button">
                  View Cameras
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>My Properties</CardTitle>
            <CardDescription>Your owned plots and properties</CardDescription>
          </CardHeader>
          <CardContent>
            {ownedPlots.length > 0 ? (
              <div className="space-y-4">
                {ownedPlots.map((plot) => (
                  <div
                    key={plot.id}
                    className="flex items-start gap-4 p-3 rounded-md hover:bg-background/50 transition-colors"
                  >
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {plot.projectName} - Plot {plot.number}
                          </p>
                          <p className="text-sm text-muted-foreground">{plot.location}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            plot.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {plot.status === "completed" ? "Completed" : "Under Development"}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Link href={`/plot/${plot.id}`}>
                          <Button variant="outline" size="sm" className="h-8 glass-button">
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/cctv/client/${plot.id}`}>
                          <Button variant="outline" size="sm" className="h-8 glass-button">
                            View CCTV
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-2">
                  <Link href="/plot/my-plots">
                    <Button className="w-full">View All Properties</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">You don't own any properties yet</p>
                <Link href="/project">
                  <Button>Browse Available Properties</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Link href="/dashboard/client/qr">
                <Button className="w-full justify-start">
                  <QrCode className="mr-2 h-4 w-4" />
                  View My QR Code
                </Button>
              </Link>

              <Link href="/dashboard/client/visitor-qr">
                <Button variant="outline" className="w-full justify-start glass-button">
                  <Calendar className="mr-2 h-4 w-4" />
                  Generate Visitor Pass
                </Button>
              </Link>

              <Link href="/cctv/client">
                <Button variant="outline" className="w-full justify-start glass-button">
                  <Camera className="mr-2 h-4 w-4" />
                  Access CCTV Feeds
                </Button>
              </Link>

              <Link href="/project">
                <Button variant="outline" className="w-full justify-start glass-button">
                  <Building2 className="mr-2 h-4 w-4" />
                  Browse More Properties
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


