import React from 'react';
import { Metadata } from 'next';

import { AdminSidebar } from '@/components/sidebar/admin-sidebar';

export const _metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Administration panel for real estate management system',
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
