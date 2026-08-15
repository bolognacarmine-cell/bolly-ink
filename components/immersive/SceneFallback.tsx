'use client';

export function SceneFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <div className="text-center p-8">
        <p className="text-white/70 text-sm">
          Esperienza 3D non disponibile su questo dispositivo
        </p>
        <p className="text-white/50 text-xs mt-2">
          Il contenuto rimane accessibile e interattivo
        </p>
      </div>
    </div>
  );
}
