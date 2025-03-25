"use client"

import { useState, useEffect } from "react"
import { useAuth } from '@/context/auth-context'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Volume2, VolumeX, Maximize2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Plot } from "@/context/auth-context"

export default function ClientCctvDetailPage({ params }: { params: { id: string } }) {
  const { user, getUserOwnedPlots } = useAuth()
  const [plot, setPlot] = useState<Plot | null>(null)
  const [loading, setLoading] = useState(true)
  const [muted, setMuted] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const fetchPlot = async () => {
      try {
        const plots = await getUserOwnedPlots()
        const foundPlot = plots.find((p: Plot) => p.id === params.id)

        if (foundPlot) {
          setPlot(foundPlot)
        }
      } catch (error) {
        console.error("Error fetching plot:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlot()
  }, [getUserOwnedPlots, params.id])

  const toggleMute = () => {
    setMuted(!muted)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!plot) {
    return (
      <div className="space-y-8">
        <Link href="/cctv/client" className="flex items-center text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to CCTV Feeds
        </Link>
        <h1 className="text-3xl font-bold mb-2">CCTV Feed Not Found</h1>
        <p className="text-muted-foreground">
          The requested CCTV feed could not be found or you do not have access to it.
        </p>
        <div className="flex justify-center">
          <Link href="/cctv/client">
            <Button>View All CCTV Feeds</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/cctv/client" className="flex items-center text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to CCTV Feeds
        </Link>
        <h1 className="text-3xl font-bold mb-2">
          CCTV Feed: {plot.projectName} - Plot {plot.number}
        </h1>
        <p className="text-muted-foreground">Live camera feed for your property</p>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-border">
        <div className="relative aspect-video">
          <Image
            src={`/placeholder.svg?height=720&width=1280&text=${encodeURIComponent(`CCTV Feed - ${plot.projectName} Plot ${plot.number}`)}`}
            alt={`CCTV Feed - ${plot.projectName}`}
            fill
            className="object-cover"
          />

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">
                  {plot.projectName} - Plot {plot.number}
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium text-white">Live</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={toggleMute}
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={toggleFullscreen}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold mb-4">Property Information</h2>
          <div className="space-y-4">
            <div className="bg-background/50 backdrop-blur-sm rounded-md p-3">
              <p className="text-sm text-muted-foreground">Project</p>
              <p className="font-medium">{plot.projectName}</p>
            </div>

            <div className="bg-background/50 backdrop-blur-sm rounded-md p-3">
              <p className="text-sm text-muted-foreground">Plot Number</p>
              <p className="font-medium">{plot.number}</p>
            </div>

            <div className="bg-background/50 backdrop-blur-sm rounded-md p-3">
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{plot.location}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Camera Information</h2>
          <div className="space-y-4">
            <div className="bg-background/50 backdrop-blur-sm rounded-md p-3">
              <p className="text-sm text-muted-foreground">Camera Type</p>
              <p className="font-medium">HD Security Camera</p>
            </div>

            <div className="bg-background/50 backdrop-blur-sm rounded-md p-3">
              <p className="text-sm text-muted-foreground">Coverage</p>
              <p className="font-medium">Main Property View</p>
            </div>

            <div className="bg-background/50 backdrop-blur-sm rounded-md p-3">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium text-green-600 dark:text-green-400">Online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

