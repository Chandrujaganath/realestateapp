'use client';

import {
  collection,
  getDocs,
  query,
  where,
  Query,
  CollectionReference,
  DocumentData,
} from 'firebase/firestore';
import { useState, useEffect, useCallback } from 'react';

import { ProjectService } from '@/features/projects/services/project-service';
import {
  Project,
  Plot,
  CreateProjectPayload,
  UpdateProjectPayload,
  CreatePlotPayload,
  UpdatePlotPayload,
} from '@/features/projects/types/project';
import { db } from '@/lib/firebase';

/**
 * Hook for accessing project data and operations
 */
export function useProjects(filterBy?: { status?: string; location?: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const projectService = new ProjectService();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);

      if (!db) {
        throw new Error('Firestore not initialized');
      }

      let projectsQuery: Query<DocumentData> = collection(db, 'projects');

      // Apply filters if provided
      if (filterBy) {
        const constraints = [];

        if (filterBy.status) {
          constraints.push(where('status', '==', filterBy.status));
        }

        if (filterBy.location) {
          constraints.push(where('location', '==', filterBy.location));
        }

        if (constraints.length > 0) {
          projectsQuery = query(projectsQuery, ...constraints);
        }
      }

      const _querySnapshot = await getDocs(projectsQuery);

      const _fetchedProjects: Project[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          startDate: data.startDate?.toDate() || new Date(),
          totalPlots: data.totalPlots || 0,
          availablePlots: data.availablePlots || 0,
          soldPlots: data.soldPlots || 0,
          reservedPlots: data.reservedPlots || 0,
          description: data.description || '',
          status: data.status,
          image: data.image,
          location: data.location,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });

      setProjects(fetchedProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [filterBy?.status, filterBy?.location]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  /**
   * Fetch a project by ID
   */
  const fetchProjectById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const project = await projectService.getProjectById(id);
      if (project) {
        setCurrentProject(project as Project);
      }
      setError(null);
      return project;
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to fetch project');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new project
   */
  const createProject = useCallback(
    async (payload: CreateProjectPayload) => {
      setLoading(true);
      try {
        const projectId = await projectService.createProject(payload);
        // Refresh the projects list
        await fetchProjects();
        setError(null);
        return projectId;
      } catch (err) {
        console.error('Error creating project:', err);
        setError('Failed to create project');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProjects]
  );

  /**
   * Update a project
   */
  const updateProject = useCallback(
    async (id: string, payload: UpdateProjectPayload) => {
      setLoading(true);
      try {
        await projectService.updateProject(id, payload);
        // Refresh the current project if it's the one being updated
        if (currentProject && currentProject.id === id) {
          await fetchProjectById(id);
        }
        // Refresh the projects list
        await fetchProjects();
        setError(null);
      } catch (err) {
        console.error('Error updating project:', err);
        setError('Failed to update project');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentProject, fetchProjectById, fetchProjects]
  );

  /**
   * Delete a project
   */
  const deleteProject = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await projectService.deleteProject(id);
        // Refresh the projects list
        await fetchProjects();
        // Clear current project if it was the one deleted
        if (currentProject && currentProject.id === id) {
          setCurrentProject(null);
        }
        setError(null);
      } catch (err) {
        console.error('Error deleting project:', err);
        setError('Failed to delete project');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentProject, fetchProjects]
  );

  /**
   * Fetch plots for a project
   */
  const fetchPlotsByProjectId = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const plotsData = await projectService.getPlotsByProjectId(projectId);
      setPlots(plotsData);
      setError(null);
      return plotsData;
    } catch (err) {
      console.error('Error fetching plots:', err);
      setError('Failed to fetch plots');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new plot
   */
  const createPlot = useCallback(
    async (payload: CreatePlotPayload) => {
      setLoading(true);
      try {
        const _plotId = await projectService.createPlot(payload);
        // Refresh plots if we're viewing the parent project
        if (currentProject && currentProject.id === payload.projectId) {
          await fetchPlotsByProjectId(payload.projectId);
          // Refresh current project to update plot counts
          await fetchProjectById(payload.projectId);
        }
        setError(null);
        return plotId;
      } catch (err) {
        console.error('Error creating plot:', err);
        setError('Failed to create plot');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentProject, fetchPlotsByProjectId, fetchProjectById]
  );

  /**
   * Update a plot
   */
  const updatePlot = useCallback(
    async (id: string, payload: UpdatePlotPayload) => {
      setLoading(true);
      try {
        const plot = await projectService.getPlotById(id);
        if (!plot) throw new Error('Plot not found');

        await projectService.updatePlot(id, payload);

        // Refresh plots if we're viewing the parent project
        if (currentProject && currentProject.id === plot.projectId) {
          await fetchPlotsByProjectId(plot.projectId);
          // Refresh current project to update plot counts
          await fetchProjectById(plot.projectId);
        }
        setError(null);
      } catch (err) {
        console.error('Error updating plot:', err);
        setError('Failed to update plot');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentProject, fetchPlotsByProjectId, fetchProjectById]
  );

  return {
    projects,
    currentProject,
    plots,
    loading,
    error,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    fetchPlotsByProjectId,
    createPlot,
    updatePlot,
  };
}
