"use client";

import { useEffect } from "react";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { ProjectGrid } from "@/features/projects/components/project-grid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, loading, error, fetchProjects } = useProjects();
  
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  const showAddButton = user?.role === "admin" || user?.role === "superadmin";
  
  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-48 bg-gray-200 animate-pulse rounded mt-2"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[350px] bg-gray-200 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium text-red-600">Error loading projects</h3>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button className="mt-4" onClick={() => fetchProjects()}>
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Browse and explore real estate projects</p>
        </div>
        
        {showAddButton && (
          <Link href="/projects/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </Link>
        )}
      </div>
      
      {/* Project grid with search/filter */}
      <ProjectGrid projects={projects} />
    </div>
  );
} 