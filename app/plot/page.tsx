"use client"

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Map, Maximize2, Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

export default function PlotPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("project")

  // Placeholder plot data
  const plots = [
    {
      id: 1,
      name: "Master Plan",
      project: "Sunrise Gardens",
      projectId: 1,
      description: "Complete layout of the Sunrise Gardens development",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: 2,
      name: "Phase 1 Plots",
      project: "Sunrise Gardens",
      projectId: 1,
      description: "Detailed view of Phase 1 residential plots",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: 3,
      name: "Master Plan",
      project: "Metropolitan Heights",
      projectId: 2,
      description: "Complete layout of the Metropolitan Heights development",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: 4,
      name: "Floor Plans",
      project: "Metropolitan Heights",
      projectId: 2,
      description: "Typical floor plans for apartment units",
      image: "/placeholder.svg?height=400&width=600",
    },
  ]

  // Filter plots by project if projectId is provided
  const filteredPlots = projectId ? plots.filter((plot) => plot.projectId === Number.parseInt(projectId)) : plots

  const isAdmin = user?.role === "admin" || user?.role === "superadmin"
  const isManager = user?.role === "manager"

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Plot Visualizer</h1>
          <p className="text-muted-foreground">
            {projectId
              ? `View plots and layouts for ${filteredPlots[0]?.project || "project"}`
              : "View plots and layouts for all projects"}
          </p>
        </div>

        {(isAdmin || isManager) && (
          <Link href="/plot/upload">
            <Button>
              <Map className="mr-2 h-4 w-4" />
              Upload New Plot
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredPlots.map((plot) => (
          <Card key={plot.id} className="glass-card overflow-hidden">
            <div className="relative">
              <div className="relative h-48 md:h-64">
                <Image src={plot.image || "/placeholder.svg"} alt={plot.name} fill className="object-cover" />

                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{plot.name}</CardTitle>
                  <CardDescription>
                    {!projectId && (
                      <Link href={`/project/${plot.projectId}`} className="hover:underline">
                        {plot.project}
                      </Link>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">{plot.description}</p>
              <div className="flex justify-between">
                <Link href={`/plot/${plot.id}`}>
                  <Button variant="outline" className="glass-button">
                    <Map className="mr-2 h-4 w-4" />
                    View Full Map
                  </Button>
                </Link>

                <Button variant="outline" className="glass-button">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPlots.length === 0 && (
          <div className="col-span-full">
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Map className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No plots available for this project</p>
                <Link href="/plot">
                  <Button variant="outline" className="glass-button">
                    View All Plots
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

