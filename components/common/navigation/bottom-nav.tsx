"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home,
  Building2,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
};

// Simplify to exactly 3 items as discussed
const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/dashboard",
    icon: Home,
    roles: ["client", "guest", "manager", "admin", "superadmin"],
  },
  {
    label: "Properties",
    href: "/project",
    icon: Building2,
    roles: ["client", "guest", "manager", "admin", "superadmin"],
  },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageSquare,
    roles: ["client", "guest", "manager", "admin", "superadmin"],
  },
];

// List of paths where bottom nav should not be shown
const excludedPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/register-client',
  '/auth/register-guest',
  '/auth/register-as-client',
  '/auth/register-as-guest',
  '/unauthorized',
  '/verify-email',
  '/reset-password',
];

export function BottomNav() {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Only show after component is mounted client-side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Determine visibility based on auth state and current path
  useEffect(() => {
    if (!mounted) return;
    
    const shouldShow = 
      user && 
      !authLoading && 
      !excludedPaths.some(path => pathname?.startsWith(path));
    
    setIsVisible(shouldShow || false);
  }, [user, authLoading, pathname, mounted]);
  
  // Early return if component is not mounted or should not be visible
  if (!mounted || !isVisible) return null;
  
  // Get user role and filter nav items
  const role = user?.role?.toLowerCase() || '';
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(role)
  );
  
  // Update the Home link to point directly to the user's dashboard based on role
  const updatedNavItems = filteredNavItems.map(item => {
    if (item.label === "Home") {
      const dashboardPath = role ? `/dashboard/${role}` : "/dashboard";
      return { ...item, href: dashboardPath };
    }
    return item;
  });
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-t border-border/40 h-16 shadow-md"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
            {updatedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname && (pathname === item.href || pathname.startsWith(`${item.href}/`));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex flex-col items-center justify-center px-5 transition-colors duration-200",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                  aria-label={item.label}
                >
                  {Icon && React.createElement(Icon as React.ComponentType<any>, {
                    className: cn(
                      "w-5 h-5 mb-1 transition-colors duration-200", 
                      isActive ? "text-primary" : "text-muted-foreground"
                    )
                  })}
                  <span className={cn(
                    "text-xs transition-colors duration-200", 
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
} 