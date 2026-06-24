'use client';

import { ScalesCanvas } from './ScalesCanvas';
import { Gavel, Scale } from 'lucide-react';

interface HeroProps {
  onOpen: () => void;
  stats: { total: number; pending: number; resolved: number; claimantWins: number };
}

export function Hero({ onOpen, stats }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-gold/15 bg-navy-950 dark:bg-black/40 py-28 text-left">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 z-10 animate-fade-in">
            <div>
              <span className="inline-flex items-center gap-2 border border-gold/30 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-gold bg-gold/5 rounded-full">
                <Scale size={11} /> Autonomous Arbitration
              </span>
              
              {/* Elegant serif heading */}
              <h1 className="mt-6 font-serif text-5xl font-400 leading-tight tracking-tight text-ink sm:text-6xl max-w-2xl">
                DECENTRALIZED COURT FOR <span className="italic text-gold">ON-CHAIN DISPUTES</span>
              </h1>
              
              <p className="mt-6 max-w-lg font-sans text-base leading-relaxed text-slatey dark:text-zinc-300">
                Genacle is a secure, autonomous AI tribunal running entirely on GenLayer. 
                File your case with agreement terms and evidence; a decentralized consensus of validator AI jurors resolves it impartially.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={onOpen}
                  className="group relative inline-flex items-center gap-3 overflow-hidden border border-gold/50 bg-gold px-8 py-4 font-mono text-xs uppercase tracking-widest text-navy-950 font-bold transition-all hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <Gavel size={15} className="transition-transform group-hover:rotate-12" />
                  File a Dispute Case
                </button>
                <a
                  href="#board"
                  className="inline-flex items-center justify-center border border-zinc-700 dark:border-zinc-800 bg-transparent hover:border-gold/50 hover:text-gold px-8 py-4 font-mono text-xs uppercase tracking-widest text-slatey transition-colors"
                >
                  View Docket Board
                </a>
              </div>
            </div>
          </div>

          {/* Scales of Justice Canvas Box */}
          <div className="relative lg:col-span-5 h-[280px] sm:h-[340px] flex items-center justify-center border border-gold/15 bg-navy-900/40 rounded-lg p-6 animate-fade-in">
            {/* Elegant double border typical of legal documents */}
            <div className="absolute inset-2 border border-double border-gold/10 rounded pointer-events-none" />
            <ScalesCanvas />
          </div>
        </div>

        {/* Legal stats ledger bar */}
        <div className="mt-20 border-t border-gold/10 pt-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: 'Total Disputes Filed', value: stats.total },
              { label: 'Pending Adjudication', value: stats.pending },
              { label: 'Cases Resolved', value: stats.resolved },
              { label: 'Claimant Rulings', value: stats.claimantWins },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="border-l border-gold/30 pl-6 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-slatey/75">{stat.label}</p>
                <p className="mt-2 font-serif text-3xl font-700 text-gold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
