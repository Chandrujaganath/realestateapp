import type { UserRole } from "@/contexts/auth-context"

export interface Announcement {
  id: string
  title: string
  content: string
  priority: "low" | "medium" | "high"
  status: "active" | "archived"
  targetRoles: UserRole[]
  createdAt: Date
  expiresAt?: Date
  createdBy: string
  updatedAt?: Date
}

export interface AnnouncementFormData {
  title: string
  content: string
  priority: "low" | "medium" | "high"
  targetRoles: UserRole[]
  expiresAt: string
  status: "active" | "archived"
}

export interface AnnouncementAPIResponse {
  announcements: {
    id: string
    title: string
    content: string
    priority: "low" | "medium" | "high"
    status: "active" | "archived"
    targetRoles: string[]
    createdAt: number
    expiresAt?: number
    createdBy: string
  }[]
} 
