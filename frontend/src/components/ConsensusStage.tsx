'use client';

import { Loader2, Scale, ShieldAlert, CheckCircle } from 'lucide-react';
import type { TxState } from '../hooks/useTransaction';
import { rulingColor, rulingLabel } from '../lib/format';

const STAGE_ORDER = ['SUBMITTED', 'PROPOSING', 'COMMITTING', 'REVEALING', 'ACCEPTED'];

function stageIndex(status: string): number {
  if (status === 'PENDING' || status === '') return 0;
  if (status === 'LEADER_TIMEOUT' || status === 'VALIDATORS_TIMEOUT') return 1;
  const i = STAGE_ORDER.indexOf(status);
  return i < 0 ? 1 : i;
}

const STAGES = [
  { key: 'SUBMITTED', label: 'Submitted', note: 'Case files broadcast to Bradbury' },
  { key: 'PROPOSING', label: 'Tribunal Deliberation', note: 'Consensus leader evaluates cases' },
  { key: 'COMMITTING', label: 'Jury Review', note: 'AI Jurors re-derive decision independently' },
  { key: 'REVEALING', label: 'Revealing Votes', note: 'Rulings and confidence aligned' },
  { key: 'ACCEPTED', label: 'Sealed Verdict', note: 'Judgment finalized under consensus' },
];

export function ConsensusStage({ tx }: { tx: TxState }) {
  const idx = stageIndex(tx.liveStatus);
  const rotating = tx.liveStatus === 'LEADER_TIMEOUT' || tx.liveStatus === 'VALIDATORS_TIMEOUT';
  const draft = tx.draft;

  return (
    <div className="flex flex-col items-center text-center py-6">
      {/* Dynamic spinning emblem using custom CSS animations */}
      <div className="relative flex h-36 w-36 items-center justify-center">
        <span className="absolute inset-0 border border-gold/20 rounded-full animate-spin-slow" />
        <span className="absolute inset-4 border border-dashed border-gold/45 rounded-full animate-spin-reverse-slow" />
        <Scale size={42} className="text-gold" />
      </div>

      <p className="font-mono text-[10px] uppercase tracking-widest text-gold mt-6">
        {rotating ? 'Leader rotated, retrying consensus' : 'Tribunal in Session'}
      </p>
      <h3 className="mt-2 font-serif text-2xl font-400 text-ink">Deliberating Verdict</h3>
      <p className="mt-2 max-w-sm text-xs text-slatey">
        GenLayer AI consensus takes 1 to 5 minutes. Every validator re-derives this decision independently.
      </p>

      {/* Progress checklist */}
      <div className="mt-8 w-full max-w-md border border-gold/15 bg-navy-950/40 rounded overflow-hidden">
        {STAGES.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <div
              key={s.key}
              className={`flex items-center gap-4 border-b border-gold/5 p-4 text-left last:border-0 ${active ? 'bg-gold/5' : ''}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center border text-xs font-mono rounded ${
                  done
                    ? 'border-emerald-500/40 text-emerald-400'
                    : active
                      ? 'border-gold text-gold'
                      : 'border-zinc-800 text-zinc-600'
                }`}
              >
                {active ? <Loader2 size={13} className="animate-spin" /> : done ? '\u2713' : i + 1}
              </span>
              <div className="min-w-0">
                <p className={`font-mono text-[11px] uppercase tracking-wider ${done || active ? 'text-ink' : 'text-zinc-600'}`}>
                  {s.label}
                </p>
                <p className="text-[10px] text-slatey/70">{s.note}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deliberation Leader Draft Ruling Box (Decoded from eq_outputs) */}
      {draft && (
        <div className="relative mt-8 w-full max-w-md border border-dashed border-gold/30 bg-navy-950/60 p-5 rounded text-left animate-slide-up">
          {/* Double border accents */}
          <div className="absolute inset-1 border border-double border-gold/10 rounded pointer-events-none" />

          <p className="font-mono text-[9px] uppercase tracking-wider text-slatey/85">
            Leader Draft (Awaiting verification)
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider rounded ${rulingColor[draft.ruling] ?? 'text-ink border-zinc-700 bg-zinc-950/20'}`}>
              {draft.ruling === 'CLAIMANT_WIN' ? <CheckCircle size={12} /> : draft.ruling === 'RESPONDENT_WIN' ? <CheckCircle size={12} /> : <ShieldAlert size={12} />}
              {rulingLabel[draft.ruling] ?? draft.ruling}
            </span>
            {typeof draft.confidence === 'number' && (
              <span className="font-serif text-3xl font-700 text-gold">
                {draft.confidence}%
              </span>
            )}
          </div>
          {draft.rationale && (
            <p className="mt-3 text-xs leading-relaxed italic text-ink/80 dark:text-zinc-200">
              "{draft.rationale}"
            </p>
          )}
        </div>
      )}

      <p className="mt-6 font-mono text-[10px] text-faint">
        Bradbury State: <span className="text-ink font-bold">{tx.liveStatus || 'PENDING'}</span>
      </p>
    </div>
  );
}
