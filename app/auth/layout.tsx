"use client";

import { AuthProvider } from "@/hooks/use-auth";
import AuthLayout from "@/components/layout/auth-layout";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthLayout>{children}</AuthLayout>
    </AuthProvider>
  );
} 