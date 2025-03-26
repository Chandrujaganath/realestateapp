'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ProjectGrid } from '@/features/projects/components/project-grid';
import { useProjects } from '@/features/projects/hooks/use-projects';
import { useAuth } from '@/hooks/use-auth';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, loading, error } = useProjects();

  const _showAddButton = user?.role === 'admin' || user?.role === 'superadmin';

  // Error state
  if (error) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium text-red-600">Error loading projects</h3>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
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

        {_showAddButton && (
          <Link href="/projects/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </Link>
        )}
      </div>

      {/* Project grid */}
      <ProjectGrid projects={projects as any} loading={loading} />
    </div>
  );
}
