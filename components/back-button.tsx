'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ href, label = 'Back', className = '' }: BackButtonProps) {
  const router = useRouter();

  const _handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={`flex items-center mb-4 hover:bg-background/60 ${className}`}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
