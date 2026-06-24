'use client';

import { Gavel, ShieldAlert, FolderOpen, RefreshCw } from 'lucide-react';

export function Skeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((n) => (
        <div key={n} className="border border-gold/10 bg-navy-900/30 p-6 rounded-md space-y-4 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-2 w-16 bg-gold/15 rounded" />
            <div className="h-4 w-12 bg-gold/15 rounded" />
          </div>
          <div className="h-5 w-3/4 bg-gold/15 rounded mt-4" />
          <div className="space-y-2 mt-4">
            <div className="h-3 w-full bg-gold/10 rounded" />
            <div className="h-3 w-5/6 bg-gold/10 rounded" />
          </div>
          <div className="flex gap-3 pt-6">
            <div className="h-8 flex-1 bg-gold/10 rounded" />
            <div className="h-8 flex-1 bg-gold/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  onOpen: () => void;
}

export function EmptyState({ onOpen }: EmptyStateProps) {
  return (
    <div className="relative border border-dashed border-gold/20 bg-navy-900/20 px-6 py-16 text-center rounded-lg max-w-xl mx-auto">
      {/* Double border accents */}
      <div className="absolute inset-1.5 border border-double border-gold/5 rounded pointer-events-none" />
      
      <FolderOpen size={48} className="mx-auto text-gold/45 mb-4" />
      <h3 className="font-serif text-xl text-ink">Court Docket is Empty</h3>
      <p className="mt-2 text-xs text-slatey max-w-sm mx-auto">
        There are currently no active disputes filed on this contract. File a new case to initiate the autonomous arbitration process.
      </p>
      <button
        type="button"
        onClick={onOpen}
        className="mt-6 border border-gold/50 text-gold bg-transparent hover:bg-gold hover:text-navy-950 px-6 py-3 font-mono text-[10px] uppercase tracking-wider transition-colors duration-200"
      >
        File the First Case
      </button>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="border border-red-500/20 bg-red-950/15 px-6 py-12 text-center rounded-lg max-w-md mx-auto">
      <ShieldAlert size={44} className="mx-auto text-red-400 mb-4" />
      <h3 className="font-serif text-lg text-red-400">Connection Failed</h3>
      <p className="mt-2 text-xs text-slatey">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 border border-red-500/30 hover:border-red-400 px-6 py-2.5 font-mono text-[10px] uppercase tracking-wider text-red-400 hover:bg-red-950/20 transition-colors"
      >
        <RefreshCw size={11} /> Retry Connection
      </button>
    </div>
  );
}
