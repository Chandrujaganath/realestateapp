"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PlotEditor } from "@/components/admin/plot-editor"
import { ProjectGridEditor } from "@/features/projects/components/project-grid-editor"
import { ManagerAssignment } from "@/components/admin/manager-assignment"
import { TimeSlotEditor } from "@/components/admin/time-slot-editor"
import { ArrowLeft, Edit, MapPin, Calendar, Users, Grid, MapPinned } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { GridCell } from "@/features/projects/types/grid"

interface ProjectDetailProps {
  projectId: string
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, "projects", projectId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setProject({
            id: docSnap.id,
            ...docSnap.data(),
          })
        } else {
          toast({
            title: "Project not found",
            description: "The requested project could not be found.",
            variant: "destructive",
          })
          router.push("/admin/projects")
        }
      } catch (error) {
        console.error("Error fetching project:", error)
        toast({
          title: "Error",
          description: "Failed to load project details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId, router, toast])

  const handleGridSave = async (gridData: { rows: number; cols: number; cells: GridCell[] }) => {
    try {
      const docRef = doc(db, "projects", projectId)
      
      // Count plot types for statistics
      const plotCounts = {
        total: gridData.cells.filter(cell => cell.type === "plot").length,
        available: gridData.cells.filter(cell => cell.type === "plot" && cell.status === "available").length,
        reserved: gridData.cells.filter(cell => cell.type === "plot" && cell.status === "reserved").length,
        sold: gridData.cells.filter(cell => cell.type === "plot" && cell.status === "sold").length,
        pending: gridData.cells.filter(cell => cell.type === "plot" && cell.status === "pending").length,
      }
      
      // Update project document
      await updateDoc(docRef, {
        gridLayout: gridData,
        totalPlots: plotCounts.total,
        availablePlots: plotCounts.available,
        soldPlots: plotCounts.sold,
        reservedPlots: plotCounts.reserved,
        updatedAt: new Date()
      })
      
      // Update local state
      setProject(prev => ({
        ...prev,
        gridLayout: gridData,
        totalPlots: plotCounts.total,
        availablePlots: plotCounts.available,
        soldPlots: plotCounts.sold,
        reservedPlots: plotCounts.reserved,
        updatedAt: new Date()
      }))
      
      toast({
        title: "Layout saved",
        description: "Project layout has been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving grid layout:", error)
      toast({
        title: "Error",
        description: "Failed to save project layout. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/admin/projects")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <Button onClick={() => router.push(`/admin/projects/${projectId}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {project.city}
                {project.address ? `, ${project.address}` : ""}
              </CardDescription>
            </div>
            {getStatusBadge(project.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Created</span>
              <span>{project.createdAt ? formatDate(project.createdAt.toDate()) : "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span>{project.updatedAt ? formatDate(project.updatedAt.toDate()) : "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Plots</span>
              <span>{project.totalPlots || 0} plots ({project.availablePlots || 0} available)</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{project.description || "No description provided."}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="grid" className="flex items-center">
            <Grid className="h-4 w-4 mr-2" />
            Grid Layout
          </TabsTrigger>
          <TabsTrigger value="managers" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Assigned Managers
          </TabsTrigger>
          <TabsTrigger value="timeslots" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Time Slots
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <ProjectGridEditor 
            projectId={projectId} 
            initialGrid={project.gridLayout || { rows: 10, cols: 10, cells: [] }}
            onSave={handleGridSave}
          />
        </TabsContent>
        
        <TabsContent value="plots">
          <PlotEditor projectId={projectId} initialPlots={project.plots || []} />
        </TabsContent>

        <TabsContent value="managers">
          <ManagerAssignment projectId={projectId} initialManagers={project.managersAssigned || []} />
        </TabsContent>

        <TabsContent value="timeslots">
          <TimeSlotEditor projectId={projectId} initialTimeSlots={project.timeSlots || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

