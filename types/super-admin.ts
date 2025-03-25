/**
 * Type definitions for the Super Admin module
 */

/** 
 * Admin user type 
 */
export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: Date
  lastLogin?: Date
}

/**
 * System template types
 */
export interface SystemTemplate {
  id: string
  name: string
  description: string
  type: "email" | "notification" | "document" | "contract"
  data: any // This will be specific to the template type
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

/**
 * System settings
 */
export interface SystemSettings {
  id: string
  maxBookingsPerDay: number
  defaultGeofenceRadius: number
  announcementDefaults: {
    duration: number
    priority: "low" | "medium" | "high"
  }
  updatedBy: string
  updatedAt: Date
}

/**
 * Audit log
 */
export interface AuditLog {
  id: string
  actionType: string
  performedBy: {
    id: string
    name: string
    role: string
  }
  targetResource: {
    type: string
    id: string
    name?: string
  }
  details: Record<string, any>
  timestamp: Date
}

/**
 * Dashboard stats
 */
export interface SuperAdminDashboardStats {
  userCounts: {
    total: number
    byRole: {
      Guest: number
      Client: number
      Manager: number
      Admin: number
      SuperAdmin: number
    }
  }
  projectStats: {
    total: number
    activePlots: number
    soldPlots: number
    pendingVisits: number
  }
  recentActivities: AuditLog[]
}

