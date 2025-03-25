"use client"

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, MapPin, Calendar, Clock, Users, Map, Camera, FileText } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import BackButton from "@/components/back-button"

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const projectId = params.id

  // Placeholder project data
  const project = {
    id: Number.parseInt(projectId),
    name: "Sunrise Gardens",
    location: "East Suburb, City",
    description:
      "Luxury residential complex with modern amenities and green spaces. Features include swimming pools, fitness centers, and landscaped gardens. Located in a prime area with easy access to schools, shopping centers, and public transportation.",
    progress: 75,
    startDate: "January 2024",
    completionDate: "December 2025",
    units: 120,
    amenities: [
      "Swimming Pool",
      "Fitness Center",
      "Children's Playground",
      "Landscaped Gardens",
      "Clubhouse",
      "Security System",
      "24/7 Maintenance",
      "Parking Space",
    ],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
  }

  return (
    <div className="space-y-8">
      <BackButton href="/project" label="Back to Projects" />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          <p className="text-muted-foreground flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {project.location}
          </p>
        </div>

        {user?.role !== "guest" && (
          <Link href={`/visit/book?project=${project.id}`}>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule a Visit
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="relative h-80 rounded-xl overflow-hidden">
            <Image src={project.images[0] || "/placeholder.svg"} alt={project.name} fill className="object-cover" />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {project.images.slice(1).map((image, index) => (
              <div key={index} className="relative h-40 rounded-xl overflow-hidden">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${project.name} ${index + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Timeline</p>
                  <p className="text-sm text-muted-foreground">
                    {project.startDate} - {project.completionDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Total Units</p>
                  <p className="text-sm text-muted-foreground">{project.units}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Construction Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>

              {(user?.role === "admin" || user?.role === "superadmin" || user?.role === "manager") && (
                <div className="pt-4">
                  <Link href={`/project/${project.id}/edit`}>
                    <Button variant="outline" className="w-full glass-button">
                      Edit Project Details
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {user?.role !== "guest" && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/visit/book?project=${project.id}`}>
                  <Button className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule a Visit
                  </Button>
                </Link>

                <Link href={`/plot?project=${project.id}`}>
                  <Button variant="outline" className="w-full justify-start glass-button">
                    <Map className="mr-2 h-4 w-4" />
                    View Plot Map
                  </Button>
                </Link>

                {(user?.role === "admin" || user?.role === "superadmin" || user?.role === "manager") && (
                  <Link href={`/cctv?project=${project.id}`}>
                    <Button variant="outline" className="w-full justify-start glass-button">
                      <Camera className="mr-2 h-4 w-4" />
                      CCTV Monitoring
                    </Button>
                  </Link>
                )}

                <Link href={`/project/${project.id}/documents`}>
                  <Button variant="outline" className="w-full justify-start glass-button">
                    <FileText className="mr-2 h-4 w-4" />
                    Project Documents
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="glass">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="updates">Construction Updates</TabsTrigger>
          {(user?.role === "admin" || user?.role === "superadmin" || user?.role === "manager") && (
            <TabsTrigger value="management">Management</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{project.description}</p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Location Advantages</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Close to major highways</li>
                    <li>5 minutes to shopping centers</li>
                    <li>10 minutes to schools and universities</li>
                    <li>Easy access to public transportation</li>
                    <li>Near parks and recreational areas</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Property Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Modern architectural design</li>
                    <li>Energy-efficient construction</li>
                    <li>High-quality materials</li>
                    <li>Spacious layouts</li>
                    <li>Ample natural lighting</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amenities" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Amenities & Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {project.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Construction Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-2 border-primary pl-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">March 15, 2025</span>
                  </div>
                  <h3 className="font-semibold">Foundation Work Completed</h3>
                  <p className="text-muted-foreground">
                    All foundation work has been completed ahead of schedule. The structural framework will begin next
                    week.
                  </p>
                </div>

                <div className="border-l-2 border-muted pl-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">February 10, 2025</span>
                  </div>
                  <h3 className="font-semibold">Site Preparation</h3>
                  <p className="text-muted-foreground">
                    Site clearing and preparation has been completed. Foundation work is scheduled to begin next week.
                  </p>
                </div>

                <div className="border-l-2 border-muted pl-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">January 5, 2025</span>
                  </div>
                  <h3 className="font-semibold">Project Launch</h3>
                  <p className="text-muted-foreground">
                    Sunrise Gardens project officially launched. Initial planning and design phase completed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {(user?.role === "admin" || user?.role === "superadmin" || user?.role === "manager") && (
          <TabsContent value="management" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Team Members</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">John Smith</p>
                          <p className="text-sm text-muted-foreground">Project Manager</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Sarah Johnson</p>
                          <p className="text-sm text-muted-foreground">Site Engineer</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Michael Brown</p>
                          <p className="text-sm text-muted-foreground">Construction Supervisor</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Project Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Planning Phase</span>
                        <span className="text-green-500">Completed</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Foundation Work</span>
                        <span className="text-green-500">Completed</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Structural Framework</span>
                        <span className="text-amber-500">In Progress</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Interior Work</span>
                        <span className="text-muted-foreground">Pending</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Finishing & Handover</span>
                        <span className="text-muted-foreground">Pending</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link href={`/project/${project.id}/edit`}>
                      <Button>Edit Project</Button>
                    </Link>
                    <Link href={`/project/${project.id}/timeline`}>
                      <Button variant="outline" className="glass-button">
                        Update Timeline
                      </Button>
                    </Link>
                    <Link href={`/project/${project.id}/team`}>
                      <Button variant="outline" className="glass-button">
                        Manage Team
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

