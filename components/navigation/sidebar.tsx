"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  Home,
  Calendar,
  Map,
  Camera,
  Bell,
  Settings,
  Users,
  BarChart3,
  Menu,
  X,
  ClipboardList,
  DollarSign,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UserRole } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface SidebarProps {
  userRole: UserRole
}

export default function Sidebar({ userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  // Define navigation items based on user role
  const navItems = getNavItems(userRole)

  return (
    <div
      className={cn(
        "h-screen sticky top-0 glass border-r border-border/50 transition-all duration-300 overflow-hidden",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <Building2 className="h-6 w-6 text-primary flex-shrink-0" />
          {!collapsed && <span className="font-bold">Real Estate</span>}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="flex-shrink-0">
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  pathname === item.href ? "bg-primary/10 text-primary" : "hover:bg-primary/5",
                  collapsed && "justify-center px-2",
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "h-6 w-6")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function getNavItems(role: UserRole) {
  // Common navigation items for all roles
  const commonItems = [
    {
      label: "Dashboard",
      href: `/dashboard/${role}`,
      icon: Home,
    },
    {
      label: "Projects",
      href: "/project",
      icon: Building2,
    },
  ]

  // Role-specific navigation items
  const roleSpecificItems = {
    guest: [{ label: "Announcements", href: "/announcement", icon: Bell }],
    client: [
      { label: "Visit Booking", href: "/visit", icon: Calendar },
      { label: "Plot Viewer", href: "/plot", icon: Map },
      { label: "Announcements", href: "/announcement", icon: Bell },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
    manager: [
      { label: "Tasks", href: "/manager/tasks", icon: ClipboardList },
      { label: "Visit Requests", href: "/manager/visit-requests", icon: Calendar },
      { label: "Sell Requests", href: "/manager/sell-requests", icon: DollarSign },
      { label: "Attendance", href: "/manager/attendance", icon: Clock },
      { label: "Leave", href: "/manager/leave", icon: Calendar },
      { label: "Plot Management", href: "/plot", icon: Map },
      { label: "CCTV Monitoring", href: "/cctv", icon: Camera },
      { label: "Announcements", href: "/announcement", icon: Bell },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
    admin: [
      { label: "User Management", href: "/dashboard/admin/users", icon: Users },
      { label: "Visit Schedule", href: "/visit", icon: Calendar },
      { label: "Plot Management", href: "/plot", icon: Map },
      { label: "CCTV Monitoring", href: "/cctv", icon: Camera },
      { label: "Announcements", href: "/announcement", icon: Bell },
      { label: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
    superadmin: [
      { label: "User Management", href: "/dashboard/superadmin/users", icon: Users },
      { label: "Visit Schedule", href: "/visit", icon: Calendar },
      { label: "Plot Management", href: "/plot", icon: Map },
      { label: "CCTV Monitoring", href: "/cctv", icon: Camera },
      { label: "Announcements", href: "/announcement", icon: Bell },
      { label: "Analytics", href: "/dashboard/superadmin/analytics", icon: BarChart3 },
      { label: "System Settings", href: "/settings", icon: Settings },
    ],
  }

  return [...commonItems, ...roleSpecificItems[role]]
}


