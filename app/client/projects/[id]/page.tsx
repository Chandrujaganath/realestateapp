"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { GridCell, GridData } from "@/features/projects/types/grid"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { ClientBottomNav } from "@/components/navigation/client-bottom-nav"
import { PageTransition } from "@/components/ui/page-transition"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorBoundary } from "@/components/error-boundary"
import { formatFirebaseError } from "@/lib/error-handling"
import { LazyGridWrapper } from "@/features/projects/components/lazy-grid-wrapper"

export default function ClientProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, "projects", params.id)
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
          router.push("/client/projects")
        }
      } catch (error) {
        console.error("Error fetching project:", error)
        const errorResponse = formatFirebaseError(error)
        toast({
          title: errorResponse.title,
          description: errorResponse.description,
          variant: errorResponse.variant,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [params.id, router, toast])

  const handlePlotSelect = (plotCell: GridCell) => {
    // You can add additional logic here when a plot is clicked
    console.log("Plot selected:", plotCell)
  }

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto p-4 pb-20">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-screen-xl mx-auto p-4 pb-20">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Project not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <PageTransition>
        <div className="max-w-screen-xl mx-auto p-4 pb-20">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => router.push("/client/projects")} className="p-0 h-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl">{project.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {project.city}
                    {project.address ? `, ${project.address}` : ""}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-start md:items-end">
                  <span className="text-sm text-muted-foreground">Available Plots</span>
                  <span className="text-lg font-medium">{project.availablePlots || 0} / {project.totalPlots || 0}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span>{project.updatedAt ? formatDate(project.updatedAt.toDate()) : "N/A"}</span>
                </div>
                {project.visitingHours && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Visiting Hours
                    </span>
                    <span>{project.visitingHours}</span>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">About this Project</h3>
                <p className="text-muted-foreground">{project.description || "No description provided."}</p>
              </div>

              {project.amenities && project.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {project.amenities.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {project.gridLayout && (
            <LazyGridWrapper 
              projectId={params.id} 
              gridData={project.gridLayout as GridData} 
              onPlotSelect={handlePlotSelect}
            />
          )}

          <ClientBottomNav />
        </div>
      </PageTransition>
    </ErrorBoundary>
  )
} 