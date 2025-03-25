"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Building2, Edit, MapPin, Users, Calendar, Clock, Trash } from "lucide-react"
import Link from "next/link"
import { type Project } from "../page"
import BackButton from "@/components/back-button"

// Extended Project type to include fields used in this component
interface ExtendedProject extends Project {
  city?: string;
  createdAt: Date;
  updatedAt: Date;
  timeSlots?: Array<{
    day: string;
    slots: Array<any>;
  }>;
}

// In Next.js 15, params are now async and should be handled appropriately
export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getProjectById, getManagers } = useAuth()
  const [project, setProject] = useState<ExtendedProject | null>(null)
  const [assignedManagers, setAssignedManagers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (!getProjectById) {
          console.error("getProjectById function is not available");
          setLoading(false);
          return;
        }
        
        // Use the id from params directly since this is a client component
        const projectId = params.id
        const projectData = await getProjectById(projectId)
        setProject(projectData as ExtendedProject)

        if (projectData && getManagers) {
          // Fetch assigned managers
          const allManagers = await getManagers()
          const managers = allManagers.filter((manager) => projectData.managersAssigned.includes(manager.uid))
          setAssignedManagers(managers)
        }
      } catch (error) {
        console.error("Error fetching project:", error)
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [params.id, getProjectById, getManagers])

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "inactive":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  if (loading) {
    return <ProjectDetailSkeleton />
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <BackButton href="/admin/projects" label="Back to Projects" />
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Project not found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The project you are looking for does not exist or has been deleted.
            </p>
            <Button onClick={() => router.push("/admin/projects")}>Back to Projects</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BackButton href="/admin/projects" label="Back to Projects" />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <Button onClick={() => router.push(`/admin/projects/${params.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Project
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plots">Plots</TabsTrigger>
          <TabsTrigger value="managers">Managers</TabsTrigger>
          <TabsTrigger value="visits">Visits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Basic information about the project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p>{project.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
                  <p>{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                  <p>{new Date(project.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Visit Time Slots</CardTitle>
              <CardDescription>Available time slots for site visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {project.timeSlots?.map((daySlot) => (
                  <div key={daySlot.day} className="space-y-2">
                    <h3 className="text-lg font-medium capitalize">{daySlot.day}</h3>
                    {daySlot.slots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No time slots available</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {daySlot.slots.map((slot, index) => (
                          <div key={index} className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {slot.start} - {slot.end}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plots" className="space-y-6 mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Plot Layout</CardTitle>
              <CardDescription>Visual layout of plots in the project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Plot Editor</h3>
                <p className="text-muted-foreground text-center mb-4">The plot editor is available in the edit mode.</p>
                <Link href={`/admin/projects/${params.id}/edit?tab=plots`}>
                  <Button>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Plots
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="managers" className="space-y-6 mt-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assigned Managers</CardTitle>
                <CardDescription>Managers assigned to this project</CardDescription>
              </div>
              <Link href={`/admin/projects/${params.id}/managers`}>
                <Button variant="outline" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Manage
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {assignedManagers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No managers assigned</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    There are no managers assigned to this project yet.
                  </p>
                  <Link href={`/admin/projects/${params.id}/managers`}>
                    <Button>
                      <Users className="mr-2 h-4 w-4" />
                      Assign Managers
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedManagers.map((manager) => (
                    <div key={manager.uid} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{manager.displayName}</p>
                          <p className="text-sm text-muted-foreground">{manager.email}</p>
                        </div>
                      </div>
                      <Badge
                        className={
                          manager.isOnLeave
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : "bg-green-500/10 text-green-500 border-green-500/20"
                        }
                      >
                        {manager.isOnLeave ? "On Leave" : "Active"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="space-y-6 mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Visit Requests</CardTitle>
              <CardDescription>Pending and recent visit requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Visit requests</h3>
                <p className="text-muted-foreground text-center mb-4">
                  View and manage visit requests for this project.
                </p>
                <Link href="/admin/visit-requests">
                  <Button>
                    <Calendar className="mr-2 h-4 w-4" />
                    View Visit Requests
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <Skeleton className="h-10 w-full" />

      <div className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-6 w-24" />
                    <div className="grid grid-cols-3 gap-2">
                      {Array(3)
                        .fill(0)
                        .map((_, j) => (
                          <Skeleton key={j} className="h-10 w-full" />
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

