'use client';

import React from 'react';

import { SuperAdminProvider } from '@/contexts/super-admin-context';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <SuperAdminProvider>{children}</SuperAdminProvider>;
}
