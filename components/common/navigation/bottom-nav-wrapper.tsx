"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./bottom-nav";

export function BottomNavWrapper() {
  const pathname = usePathname();
  const isNotFoundPage = pathname === "/_not-found";

  if (isNotFoundPage) return null;
  
  return <BottomNav />;
} 