'use client';

import { X, Scale, FileText, CheckCircle, ShieldAlert } from 'lucide-react';
import type { Dispute } from '../lib/contract';
import { rulingColor, rulingLabel, shortAddress } from '../lib/format';

interface CaseDetailModalProps {
  dispute: Dispute | null;
  onClose: () => void;
}

export function CaseDetailModal({ dispute, onClose }: CaseDetailModalProps) {
  if (!dispute) return null;
  const isResolved = dispute.status === 'RESOLVED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal body */}
      <div className="relative w-full max-w-2xl border border-gold/20 bg-navy-900 shadow-2xl rounded-lg overflow-hidden text-left z-10 animate-scale-up">
        {/* Double border accents */}
        <div className="absolute inset-1.5 border border-double border-gold/10 rounded pointer-events-none" />

        {/* Header */}
        <div className="relative border-b border-gold/10 bg-navy-950/50 p-6 flex items-center justify-between z-10">
          <h2 className="font-serif text-xl font-400 tracking-tight text-gold uppercase flex items-center gap-3">
            <Scale size={18} />
            Case File: {dispute.id}
          </h2>
          <button
            onClick={onClose}
            className="text-slatey hover:text-gold transition-colors focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 max-h-[75vh] overflow-y-auto scrollbar z-10 relative space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-400 text-ink leading-tight">
              {dispute.title}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2 items-center text-slatey text-[10px] font-mono">
              <span>Filed by: <span className="text-gold">{shortAddress(dispute.creator)}</span></span>
              <span className="text-zinc-700">•</span>
              <span>Status: <span className={`uppercase font-bold ${isResolved ? 'text-emerald-500' : 'text-indigo-400'}`}>{dispute.status}</span></span>
            </div>
          </div>

          {/* Verdict Box if resolved */}
          {isResolved && (
            <div className="relative border border-gold/20 bg-gold/5 p-5 rounded">
              <div className="absolute inset-1 border border-double border-gold/10 rounded pointer-events-none" />
              <h4 className="font-mono text-[10px] uppercase tracking-wider text-gold mb-3">
                Tribunal Ruling Verdict
              </h4>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 border px-3 py-1 font-mono text-[10px] uppercase tracking-wider rounded ${rulingColor[dispute.ruling]}`}>
                  {dispute.ruling === 'CLAIMANT_WIN' ? <CheckCircle size={12} /> : dispute.ruling === 'RESPONDENT_WIN' ? <CheckCircle size={12} /> : <ShieldAlert size={12} />}
                  {rulingLabel[dispute.ruling] ?? dispute.ruling}
                </span>
                <span className="font-serif text-3xl font-700 text-gold">
                  {dispute.confidence}% Confidence
                </span>
              </div>
              <p className="mt-3 text-xs italic leading-relaxed text-ink/90 dark:text-zinc-200">
                "{dispute.rationale}"
              </p>
              <div className="mt-4 pt-3 border-t border-gold/10 font-mono text-[9px] text-faint flex justify-between">
                <span>Resolved by: {shortAddress(dispute.resolver)}</span>
              </div>
            </div>
          )}

          {/* Dossier details */}
          <div className="space-y-5">
            <div className="border border-gold/10 bg-navy-950/20 p-5 rounded">
              <h4 className="font-mono text-[10px] uppercase tracking-wider text-gold mb-2 flex items-center gap-2">
                <FileText size={12} /> Contract Specification (Agreement Terms)
              </h4>
              <p className="text-xs leading-relaxed text-slatey dark:text-zinc-300 whitespace-pre-wrap">
                {dispute.agreement}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="border border-gold/10 bg-navy-950/25 p-5 rounded">
                <h4 className="font-mono text-[10px] uppercase tracking-wider text-emerald-500/80 mb-2">
                  Claimant's Case Arguments
                </h4>
                <p className="text-xs leading-relaxed text-slatey dark:text-zinc-300 whitespace-pre-wrap">
                  {dispute.claimant_case}
                </p>
              </div>

              <div className="border border-gold/10 bg-navy-950/25 p-5 rounded">
                <h4 className="font-mono text-[10px] uppercase tracking-wider text-amber-500/80 mb-2">
                  Respondent's Case Arguments
                </h4>
                <p className="text-xs leading-relaxed text-slatey dark:text-zinc-300 whitespace-pre-wrap">
                  {dispute.respondent_case}
                </p>
              </div>
            </div>

            {isResolved && (
              <div className="border border-gold/10 bg-navy-950/20 p-5 rounded">
                <h4 className="font-mono text-[10px] uppercase tracking-wider text-gold mb-2">
                  Submitted Evidence & Telemetry Logs
                </h4>
                <p className="text-xs font-mono leading-relaxed text-slatey bg-black/35 p-3 border border-gold/5 rounded whitespace-pre-wrap">
                  {dispute.rationale ? "Evidence reviewed by the on-chain AI panel under consensus validator execution." : "No explicit evidence was logged in storage."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
