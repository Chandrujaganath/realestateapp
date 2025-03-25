"use client"

import Link from "next/link"
import { Building2, Home, MessageSquare } from "lucide-react"
import type { UserRole } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  userRole: UserRole
  currentPath: string
}

export default function MobileNav({ userRole, currentPath }: MobileNavProps) {
  // Update navigation items to match global BottomNav component
  const navItems = [
    { 
      label: "Home", 
      href: `/dashboard/${userRole.toLowerCase()}`, 
      icon: Home 
    },
    { 
      label: "Properties", 
      href: "/project", 
      icon: Building2 
    },
    { 
      label: "Messages", 
      href: "/messages", 
      icon: MessageSquare 
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-background/80 border-t border-border/40 z-50 shadow-md">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full",
              currentPath === item.href ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}


