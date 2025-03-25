"use client";

import React from "react";
import { PageHeader } from "@/components/page-header";
import { usePathname } from "next/navigation";

/**
 * Layout for all dashboard pages
 * Provides consistent layout with page header
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Extract page title from pathname
  const getPageTitle = () => {
    // Remove leading slash and split by slashes
    const parts = pathname.substring(1).split("/");
    
    // If it's a root dashboard path, return dashboard
    if (parts.length === 1 && parts[0] === "dashboard") {
      return "Dashboard";
    }
    
    // Get the last meaningful part of the path (e.g., "projects" from "/admin/projects")
    // Skip IDs (parts that start with "[" or look like IDs)
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      if (part && !part.startsWith("[") && !/^[a-f0-9]{24}$/.test(part)) {
        // Capitalize first letter
        return part.charAt(0).toUpperCase() + part.slice(1);
      }
    }
    
    return "Dashboard";
  };
  
  return (
    <div className="flex flex-col">
      <PageHeader title={getPageTitle()} />
      
      <main className="flex-1 container mx-auto p-4">
        {children}
      </main>
    </div>
  );
} 