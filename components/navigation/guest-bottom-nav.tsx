"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Building2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export function GuestBottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      label: "Home",
      href: "/dashboard/guest",
      icon: Home,
      active: pathname === "/dashboard/guest",
    },
    {
      label: "Properties",
      href: "/project",
      icon: Building2,
      active: pathname.includes("/project"),
    },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageSquare,
      active: pathname.includes("/messages"),
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-background/80 border-t border-border/40 h-16 z-50 shadow-md">
      <div className="grid grid-cols-3 h-full">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center text-center text-xs space-y-1 transition-colors",
              item.active
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
} 