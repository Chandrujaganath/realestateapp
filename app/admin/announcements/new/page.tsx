"use client"

import { AnnouncementForm } from "@/components/admin/announcement-form"
import { PageHeader } from "@/components/page-header"
import { BellPlus } from "lucide-react"

export default function NewAnnouncementPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Create Announcement" 
        description="Create a new announcement for users"
        icon={<BellPlus className="h-6 w-6" />}
      />
      <AnnouncementForm mode="create" />
    </div>
  )
} 