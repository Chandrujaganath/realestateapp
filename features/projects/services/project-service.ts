import { FirebaseService } from "@/services/firebase-service";
import { 
  Project, 
  CreateProjectPayload, 
  UpdateProjectPayload,
  Plot,
  CreatePlotPayload,
  UpdatePlotPayload
} from "@/features/projects/types/project";
import { where, orderBy, limit, query, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Service for handling project-related operations
 */
export class ProjectService extends FirebaseService {
  private projectsCollection = "projects";
  private plotsCollection = "plots";
  
  /**
   * Get all projects
   */
  async getAllProjects(): Promise<Project[]> {
    return this.getAllDocs<Project>(this.projectsCollection, "updatedAt", "desc");
  }
  
  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<Project | null> {
    return this.getDocById<Project>(this.projectsCollection, id);
  }
  
  /**
   * Create new project
   */
  async createProject(payload: CreateProjectPayload): Promise<string> {
    const projectData = {
      ...payload,
      // Initialize counter fields
      totalPlots: payload.totalPlots || 0,
      availablePlots: payload.totalPlots || 0,
      soldPlots: 0,
      reservedPlots: 0,
      status: payload.status || "active",
    };
    
    return this.addDoc<CreateProjectPayload & { 
      totalPlots: number;
      availablePlots: number;
      soldPlots: number;
      reservedPlots: number;
    }>(this.projectsCollection, projectData);
  }
  
  /**
   * Update project
   */
  async updateProject(id: string, payload: UpdateProjectPayload): Promise<void> {
    await this.updateDoc(this.projectsCollection, id, payload);
  }
  
  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<void> {
    await this.deleteDoc(this.projectsCollection, id);
  }
  
  /**
   * Get projects by manager ID
   */
  async getProjectsByManagerId(managerId: string): Promise<Project[]> {
    return this.queryDocs<Project>(
      this.projectsCollection,
      [where("managerId", "==", managerId), orderBy("updatedAt", "desc")]
    );
  }
  
  /**
   * Get recent projects
   */
  async getRecentProjects(count: number = 5): Promise<Project[]> {
    return this.queryDocs<Project>(
      this.projectsCollection,
      [orderBy("createdAt", "desc"), limit(count)]
    );
  }
  
  /**
   * Get active projects
   */
  async getActiveProjects(): Promise<Project[]> {
    return this.queryDocs<Project>(
      this.projectsCollection,
      [where("status", "==", "active"), orderBy("updatedAt", "desc")]
    );
  }
  
  /**
   * Get all plots for a project
   */
  async getPlotsByProjectId(projectId: string): Promise<Plot[]> {
    return this.queryDocs<Plot>(
      this.plotsCollection,
      [where("projectId", "==", projectId), orderBy("plotNumber", "asc")]
    );
  }
  
  /**
   * Get plot by ID
   */
  async getPlotById(id: string): Promise<Plot | null> {
    return this.getDocById<Plot>(this.plotsCollection, id);
  }
  
  /**
   * Create new plot
   */
  async createPlot(payload: CreatePlotPayload): Promise<string> {
    const plotData = {
      ...payload,
      status: payload.status || "available",
    };
    
    const plotId = await this.addDoc<CreatePlotPayload & { status: string }>(
      this.plotsCollection, 
      plotData
    );
    
    // Update project counts
    const project = await this.getProjectById(payload.projectId);
    if (project) {
      await this.updateProject(payload.projectId, {
        totalPlots: project.totalPlots + 1,
        availablePlots: project.availablePlots + 1,
      });
    }
    
    return plotId;
  }
  
  /**
   * Update plot
   */
  async updatePlot(id: string, payload: UpdatePlotPayload): Promise<void> {
    const plot = await this.getPlotById(id);
    if (!plot) throw new Error("Plot not found");
    
    // Handle status change for project counting
    if (payload.status && payload.status !== plot.status) {
      const project = await this.getProjectById(plot.projectId);
      if (project) {
        // Calculate the new counts
        let availableDelta = 0;
        let soldDelta = 0;
        let reservedDelta = 0;
        
        // Subtract from old status
        if (plot.status === "available") availableDelta--;
        else if (plot.status === "sold") soldDelta--;
        else if (plot.status === "reserved") reservedDelta--;
        
        // Add to new status
        if (payload.status === "available") availableDelta++;
        else if (payload.status === "sold") soldDelta++;
        else if (payload.status === "reserved") reservedDelta++;
        
        // Update project
        await this.updateProject(plot.projectId, {
          availablePlots: project.availablePlots + availableDelta,
          soldPlots: project.soldPlots + soldDelta,
          reservedPlots: project.reservedPlots + reservedDelta,
        });
      }
    }
    
    await this.updateDoc(this.plotsCollection, id, payload);
  }
  
  /**
   * Delete plot
   */
  async deletePlot(id: string): Promise<void> {
    const plot = await this.getPlotById(id);
    if (!plot) throw new Error("Plot not found");
    
    // Update project counts
    const project = await this.getProjectById(plot.projectId);
    if (project) {
      const updates: any = {
        totalPlots: project.totalPlots - 1,
      };
      
      if (plot.status === "available") {
        updates.availablePlots = project.availablePlots - 1;
      } else if (plot.status === "sold") {
        updates.soldPlots = project.soldPlots - 1;
      } else if (plot.status === "reserved") {
        updates.reservedPlots = project.reservedPlots - 1;
      }
      
      await this.updateProject(plot.projectId, updates);
    }
    
    await this.deleteDoc(this.plotsCollection, id);
  }
  
  /**
   * Get plots owned by a user
   */
  async getPlotsByOwnerId(ownerId: string): Promise<Plot[]> {
    return this.queryDocs<Plot>(
      this.plotsCollection,
      [where("ownerId", "==", ownerId), orderBy("updatedAt", "desc")]
    );
  }
} 