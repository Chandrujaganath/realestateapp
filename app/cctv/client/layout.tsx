'use client';

import React from 'react';

export default function CctvClientLayout({ children }: { children: React.ReactNode }) {
  // We're using client component to ensure useAuth works correctly
  return <>{children}</>;
}
