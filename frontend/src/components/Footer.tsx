'use client';

import { ExternalLink, Gavel, Scale } from 'lucide-react';
import { EXPLORER, FAUCET } from '../lib/contract';

export function Footer() {
  return (
    <footer className="border-t border-gold/15 bg-navy-950 py-16 text-left">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-gold">
              <Scale size={16} />
              <span className="font-serif text-base uppercase tracking-wider">GENACLE</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slatey max-w-sm">
              An award-winning autonomous court powered by GenLayer. Arbitrates natural-language agreements through independent AI validator consensus.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-[11px] font-mono text-slatey uppercase tracking-wider">
            <div>
              <p className="text-gold/70 mb-2">Bradbury network</p>
              <ul className="space-y-2">
                <li>
                  <a
                    href={EXPLORER}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-gold flex items-center gap-1"
                  >
                    Explorer <ExternalLink size={9} />
                  </a>
                </li>
                <li>
                  <a
                    href={FAUCET}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-gold flex items-center gap-1"
                  >
                    Faucet <ExternalLink size={9} />
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-gold/70 mb-2">Legal Disclaimer</p>
              <p className="normal-case max-w-xs text-[10px] text-faint leading-normal font-sans">
                Genacle is a decentralized testnet simulation running on GenLayer Bradbury. It evaluates text evidence and does not constitute formal legal counsel.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gold/5 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[10px] font-mono text-faint">
          <p>© 2026 Genacle. Sealed under consensus.</p>
          <p className="mt-2 sm:mt-0">Built on py-genlayer</p>
        </div>
      </div>
    </footer>
  );
}
