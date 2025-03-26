import { Loader2 } from 'lucide-react';
import type React from 'react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 24, className = '' }: LoadingSpinnerProps) {
  return <Loader2 className={`animate-spin ${className}`} size={size} />;
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
}

export function LoadingOverlay({ isLoading, children, text = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}

      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <LoadingSpinner size={32} className="text-primary mb-2" />
          <p className="text-sm font-medium">{text}</p>
        </div>
      )}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <LoadingSpinner size={48} className="text-primary mb-4" />
      <p className="text-lg font-medium">Loading...</p>
    </div>
  );
}

export function LoadingButton({
  isLoading,
  children,
  ...props
}: React.ComponentProps<'button'> & { isLoading: boolean }) {
  return (
    <button
      disabled={isLoading}
      className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size={16} className="mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
