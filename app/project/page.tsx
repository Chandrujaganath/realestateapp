"use client"

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ProjectsPage() {
  const { user } = useAuth()

  // Placeholder projects data
  const projects = [
    {
      id: 1,
      name: "Sunrise Gardens",
      location: "East Suburb, City",
      description: "Luxury residential complex with modern amenities and green spaces.",
      progress: 75,
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      id: 2,
      name: "Metropolitan Heights",
      location: "Downtown, City",
      description: "High-rise apartments with panoramic city views and premium finishes.",
      progress: 90,
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      id: 3,
      name: "Riverside Villas",
      location: "Riverside District, City",
      description: "Exclusive waterfront villas with private gardens and boat docks.",
      progress: 60,
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      id: 4,
      name: "Green Valley",
      location: "North Hills, City",
      description: "Eco-friendly community with sustainable features and natural surroundings.",
      progress: 40,
      image: "/placeholder.svg?height=300&width=500",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Real Estate Projects</h1>
        <p className="text-muted-foreground">Browse our available properties and developments</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="glass-card overflow-hidden">
            <div className="relative h-48">
              <Image src={project.image || "/placeholder.svg"} alt={project.name} fill className="object-cover" />
            </div>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {project.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{project.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Construction Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href={`/project/${project.id}`}>
                <Button variant="outline" className="glass-button">
                  View Details
                </Button>
              </Link>
              {user?.role !== "guest" && (
                <Link href={`/visit/book?project=${project.id}`}>
                  <Button>
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Visit
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {(user?.role === "admin" || user?.role === "superadmin" || user?.role === "manager") && (
        <div className="flex justify-end">
          <Link href="/project/create">
            <Button>
              <Building2 className="mr-2 h-4 w-4" />
              Add New Project
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

