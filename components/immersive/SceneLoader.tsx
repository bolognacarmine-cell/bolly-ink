'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function SceneLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <LoadingSpinner size="lg" />
    </div>
  );
}
