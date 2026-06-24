'use client';

import { Gavel, CheckCircle, Scale, ShieldAlert } from 'lucide-react';
import type { Dispute } from '../lib/contract';
import { rulingColor, rulingLabel, statusColor } from '../lib/format';

interface DisputeCardProps {
  dispute: Dispute;
  onSelect: (d: Dispute) => void;
  onResolve: (d: Dispute) => void;
}

export function DisputeCard({ dispute, onSelect, onResolve }: DisputeCardProps) {
  const isResolved = dispute.status === 'RESOLVED';

  return (
    <div className="relative border border-gold/15 bg-navy-900/60 p-6 flex flex-col justify-between hover:border-gold/30 transition-all rounded-md">
      {/* Editorial layout corner markings */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-gold/40" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-gold/40" />

      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-wider text-slatey/80">
            Case Dossier: {dispute.id}
          </span>
          <span className={`inline-flex px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest rounded border ${statusColor[dispute.status]}`}>
            {dispute.status}
          </span>
        </div>

        <h3 className="mt-4 font-serif text-lg font-400 leading-snug text-ink line-clamp-2">
          {dispute.title}
        </h3>

        <p className="mt-3 text-xs leading-relaxed text-slatey line-clamp-3">
          {dispute.agreement}
        </p>

        {isResolved && (
          <div className="mt-5 border-t border-gold/10 pt-4">
            <span className="block font-mono text-[9px] uppercase tracking-wider text-slatey/70 mb-1">
              Consensus Ruling
            </span>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider rounded ${rulingColor[dispute.ruling]}`}>
                {dispute.ruling === 'CLAIMANT_WIN' ? <CheckCircle size={10} /> : dispute.ruling === 'RESPONDENT_WIN' ? <CheckCircle size={10} /> : <ShieldAlert size={10} />}
                {rulingLabel[dispute.ruling] ?? dispute.ruling}
              </span>
              <span className="font-serif text-lg font-700 text-gold">
                {dispute.confidence}%
              </span>
            </div>
            {dispute.rationale && (
              <p className="mt-2 text-[11px] italic leading-relaxed text-ink/80 line-clamp-2">
                "{dispute.rationale}"
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gold/5 flex gap-3">
        <button
          type="button"
          onClick={() => onSelect(dispute)}
          className="flex-1 border border-zinc-700 dark:border-zinc-800 hover:border-gold/30 hover:text-gold py-2.5 font-mono text-[10px] uppercase tracking-wider text-slatey transition-colors text-center"
        >
          View Dossier
        </button>
        {!isResolved && (
          <button
            type="button"
            onClick={() => onResolve(dispute)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 border border-gold/50 text-gold bg-transparent hover:bg-gold hover:text-navy-950 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-colors duration-200 text-center"
          >
            <Gavel size={11} />
            Resolve Case
          </button>
        )}
      </div>
    </div>
  );
}
