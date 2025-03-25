export interface AdminUser {
  id: string
  name: string
  email: string
  role: "Admin"
  isActive: boolean
  createdAt: Date
  lastLogin?: Date
}

export interface SystemTemplate {
  id: string
  name: string
  description: string
  type: "plotLayout" | "timeSlots" | "managerTasks"
  data: any // This will be specific to the template type
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

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
  details: any
  timestamp: Date
}

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

