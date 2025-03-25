"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  image?: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectGridProps {
  projects: Project[];
  loading?: boolean;
}

export function ProjectGrid({ projects, loading = false }: ProjectGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="opacity-60 animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
            <CardHeader>
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-5/6" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
            </CardContent>
            <CardFooter>
              <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No projects found</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          There are no projects available at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link href={`/project/${project.id}`} key={project.id}>
          <Card className="h-full transition-all hover:shadow-md">
            <div className="relative h-48 w-full">
              {project.image ? (
                <Image 
                  src={project.image} 
                  alt={project.name} 
                  fill 
                  className="object-cover rounded-t-lg"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">No image</span>
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                {project.description}
              </p>
              <p className="text-sm mt-2">
                <span className="font-medium">Location:</span> {project.location}
              </p>
            </CardContent>
            <CardFooter>
              <Badge variant={project.status === 'active' ? 'default' : project.status === 'completed' ? 'outline' : 'secondary'}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
} 