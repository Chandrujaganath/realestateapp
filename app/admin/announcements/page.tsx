"use client"

import { AnnouncementManagement } from "@/components/admin/announcement-management"
import { PageHeader } from "@/components/page-header"
import { BellRing } from "lucide-react"

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Announcements" 
        description="Manage announcements for different user roles"
        icon={<BellRing className="h-6 w-6" />}
      />
      <AnnouncementManagement />
    </div>
  )
}

