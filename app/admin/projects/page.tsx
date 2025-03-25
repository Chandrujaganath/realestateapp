"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Search, 
  PlusCircle, 
  MapPin, 
  Calendar, 
  Users, 
  BarChart, 
  Eye,
  Edit,
  Trash2
} from "lucide-react"
import Link from "next/link"

interface Project {
  id: string;
  name: string;
  location: string;
  status: "active" | "pending" | "inactive";
  totalPlots: number;
  soldPlots: number;
  startDate: string;
  managerId: string | null;
  managerName: string | null;
}

export default function ProjectsPage() {
  const { getProjects } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "active" | "pending" | "inactive">("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (getProjects) {
          const data = await getProjects()
          setProjects(data || [])
          setFilteredProjects(data || [])
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [getProjects])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      if (activeTab === "all") {
        setFilteredProjects(projects)
      } else {
        setFilteredProjects(projects.filter(project => project.status === activeTab))
      }
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = projects.filter(
        project => 
          (activeTab === "all" || project.status === activeTab) &&
          (project.name.toLowerCase().includes(query) || 
          project.location.toLowerCase().includes(query))
      )
      setFilteredProjects(filtered)
    }
  }, [searchQuery, projects, activeTab])

  const handleTabChange = (value: "all" | "active" | "pending" | "inactive") => {
    setActiveTab(value)
    setSearchQuery("")
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  if (loading) {
    return <ProjectsSkeleton />
  }

  // Mock data for demonstration
  const mockProjects = filteredProjects.length > 0 ? filteredProjects : [
    {
      id: "1",
      name: "Sunrise Gardens",
      location: "East Valley, CA",
      status: "active",
      totalPlots: 120,
      soldPlots: 78,
      startDate: "2023-01-10",
      managerId: "1",
      managerName: "John Smith",
    },
    {
      id: "2",
      name: "Metropolitan Heights",
      location: "Downtown, NY",
      status: "active",
      totalPlots: 85,
      soldPlots: 52,
      startDate: "2023-02-15",
      managerId: "1",
      managerName: "John Smith",
    },
    {
      id: "3",
      name: "Urban Square",
      location: "Central District, WA",
      status: "active",
      totalPlots: 64,
      soldPlots: 30,
      startDate: "2023-03-22",
      managerId: "2",
      managerName: "Emily Johnson",
    },
    {
      id: "4",
      name: "Lakeside Villas",
      location: "Lake County, FL",
      status: "active",
      totalPlots: 45,
      soldPlots: 20,
      startDate: "2023-04-05",
      managerId: "4",
      managerName: "Sarah Wilson",
    },
    {
      id: "5",
      name: "The Highlands",
      location: "Mountain View, CO",
      status: "inactive",
      totalPlots: 35,
      soldPlots: 35,
      startDate: "2022-08-12",
      managerId: "4",
      managerName: "Sarah Wilson",
    },
    {
      id: "6",
      name: "Coastal Residences",
      location: "Beachside, FL",
      status: "pending",
      totalPlots: 92,
      soldPlots: 0,
      startDate: "2023-09-01",
      managerId: null,
      managerName: null,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage real estate projects</p>
        </div>
        <Link href="/admin/projects/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockProjects.map((project) => (
          <Link href={`/admin/projects/${project.id}`} key={project.id}>
            <Card className="h-full transition-all hover:shadow-md cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" />
                      {project.location}
                    </div>
                  </div>
                  <Badge 
                    variant={
                      project.status === "active" 
                        ? "default" 
                        : project.status === "pending" 
                          ? "secondary" 
                          : "outline"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Plot Sales</div>
                      <div className="text-sm font-medium">
                        {project.soldPlots}/{project.totalPlots}
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${(project.soldPlots / project.totalPlots) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Started</div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{project.startDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground mb-1">Project Manager</div>
                    <div className="flex items-center">
                      <Users className="mr-1 h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {project.managerName || "Not assigned"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-1 h-3 w-3" />
                      Details
                    </Button>
                    <Button variant="outline" size="sm" className="w-auto">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="w-auto">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

function ProjectsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <Skeleton className="h-10 w-full md:w-80" />
        <Skeleton className="h-10 w-full md:w-80" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>

                  <div className="pt-2 border-t space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-4 w-32" />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}

