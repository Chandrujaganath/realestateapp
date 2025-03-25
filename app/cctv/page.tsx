"use client"

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Building2, Maximize2, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

export default function CCTVPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("project")

  // Check if user has permission to view CCTV
  if (user?.role === "client" || user?.role === "guest") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Camera className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-muted-foreground mb-6">You do not have permission to view CCTV feeds.</p>
        <Link href="/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    )
  }

  // Placeholder CCTV data
  const cctvCameras = [
    {
      id: 1,
      name: "Main Entrance",
      project: "Sunrise Gardens",
      projectId: 1,
      status: "online",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: 2,
      name: "Construction Site A",
      project: "Sunrise Gardens",
      projectId: 1,
      status: "online",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: 3,
      name: "Parking Area",
      project: "Sunrise Gardens",
      projectId: 1,
      status: "offline",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: 4,
      name: "Main Entrance",
      project: "Metropolitan Heights",
      projectId: 2,
      status: "online",
      image: "/placeholder.svg?height=300&width=400",
    },
  ]

  // Filter cameras by project if projectId is provided
  const filteredCameras = projectId
    ? cctvCameras.filter((camera) => camera.projectId === Number.parseInt(projectId))
    : cctvCameras

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">CCTV Monitoring</h1>
          <p className="text-muted-foreground">
            {projectId
              ? `Live camera feeds for ${filteredCameras[0]?.project || "project"}`
              : "Live camera feeds from all project sites"}
          </p>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="glass-button">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Feeds
          </Button>

          {!projectId && (
            <Link href="/cctv/manage">
              <Button>
                <Camera className="mr-2 h-4 w-4" />
                Manage Cameras
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredCameras.map((camera) => (
          <Card key={camera.id} className="glass-card overflow-hidden">
            <div className="relative">
              <div className="relative h-48 md:h-64">
                <Image src={camera.image || "/placeholder.svg"} alt={camera.name} fill className="object-cover" />

                {camera.status === "offline" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <p className="text-white font-medium">Camera Offline</p>
                  </div>
                )}

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
                  <div
                    className={`h-2 w-2 rounded-full ${camera.status === "online" ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <span className="text-xs font-medium">{camera.status === "online" ? "Live" : "Offline"}</span>
                </div>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{camera.name}</CardTitle>
                  <CardDescription>
                    {!projectId && (
                      <Link href={`/project/${camera.projectId}`} className="hover:underline">
                        {camera.project}
                      </Link>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <Link href={`/cctv/${camera.id}`}>
                  <Button variant="outline" className="glass-button">
                    View Full Screen
                  </Button>
                </Link>

                {!projectId && (
                  <Link href={`/project/${camera.projectId}`}>
                    <Button variant="outline" className="glass-button">
                      <Building2 className="mr-2 h-4 w-4" />
                      View Project
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCameras.length === 0 && (
          <div className="col-span-full">
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No cameras available for this project</p>
                <Link href="/cctv">
                  <Button variant="outline" className="glass-button">
                    View All Cameras
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

