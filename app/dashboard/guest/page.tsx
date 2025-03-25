"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Calendar, Map } from "lucide-react"
import Link from "next/link"
import { UserAnnouncements } from "@/components/announcements/user-announcements"
import { ImportantAnnouncementBanner } from "@/components/announcements/important-announcement-banner"

interface ExtendedUser {
  displayName?: string;
  // Add the missing property
  expiryDate?: string | number | Date;
  // Add other properties as needed
}

export default function GuestDashboard() {
  const { user } = useAuth() as { user: ExtendedUser | null };

  return (
    <div className="space-y-8">
      <ImportantAnnouncementBanner />
      
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.displayName || "Guest"}</h1>
        <p className="text-muted-foreground">Explore properties and schedule visits</p>
        {user?.expiryDate && (
          <p className="text-sm text-amber-500 mt-2">
            Your guest account is valid until {new Date(user.expiryDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <UserAnnouncements />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Browse Projects
            </CardTitle>
            <CardDescription>Explore available real estate projects</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">View our portfolio of properties and find the perfect match for your needs.</p>
            <Link href="/project">
              <Button className="w-full">View Projects</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              My Visits
            </CardTitle>
            <CardDescription>Manage your scheduled site visits</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">View your upcoming visits, access QR codes, and check visit status.</p>
            <Link href="/visit/my-visits">
              <Button className="w-full">View My Visits</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              Plot Viewer
            </CardTitle>
            <CardDescription>Explore available plots</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">View interactive plot layouts and check availability in real-time.</p>
            <Link href="/plot">
              <Button className="w-full">View Plots</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Guest Account Information</CardTitle>
          <CardDescription>Important information about your temporary access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            As a guest, you have access to browse our projects, view plot layouts, and schedule site visits. Your
            account is temporary and will be automatically deactivated after your visit.
          </p>

          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-md p-4">
            <h3 className="font-medium text-amber-800 dark:text-amber-300 mb-2">Important Notes:</h3>
            <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-400 text-sm">
              <li>Your guest account is valid for a limited time</li>
              <li>After scheduling a visit, you'll receive a QR code for site entry</li>
              <li>Please arrive on time for your scheduled visit</li>
              <li>We appreciate your feedback after the visit</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Link href="/project">
              <Button>
                <Building2 className="mr-2 h-4 w-4" />
                Browse Projects
              </Button>
            </Link>
            <Link href="/visit/book">
              <Button variant="outline" className="glass-button">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule a Visit
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

