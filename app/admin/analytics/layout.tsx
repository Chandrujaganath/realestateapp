import React from 'react';
import { Metadata } from 'next';

export const _metadata: Metadata = {
  title: 'Admin Analytics Dashboard',
  description: 'Comprehensive system analytics for admin users',
};

interface AnalyticsLayoutProps {
  children: React.ReactNode;
}

export default function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">{children}</section>
  );
}
