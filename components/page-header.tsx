'use client';

import React from 'react';

import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  centered?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  icon,
  centered = false,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 pb-5 md:flex-row md:items-center md:justify-between',
        centered && 'text-center md:text-left',
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        </div>
        {description && <p className="text-sm text-muted-foreground md:text-base">{description}</p>}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  );
}
