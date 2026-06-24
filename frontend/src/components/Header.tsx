'use client';

import { Gavel, Globe, Wallet, ExternalLink, Settings } from 'lucide-react';
import type { WalletState } from '../hooks/useWallet';
import { shortAddress } from '../lib/format';
import { useState, useEffect } from 'react';

interface HeaderProps {
  wallet: WalletState;
  onOpen: () => void;
}

export function Header({ wallet, onOpen }: HeaderProps) {

  return (
    <header className="border-b border-gold/15 bg-navy-950/80 backdrop-blur-md sticky top-0 z-40 py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center border border-gold bg-gold/5 text-gold rounded">
              <Gavel size={18} />
            </span>
            <div>
              <h2 className="font-serif text-xl font-400 tracking-wider text-gold uppercase">
                GENACLE
              </h2>
              <p className="font-mono text-[8px] tracking-widest text-slatey uppercase mt-0.5">
                Decentralized Court
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Wallet Connector */}
            {wallet.address ? (
              <div className="flex items-center border border-emerald-500/20 bg-emerald-950/15 rounded-md px-3 py-2 font-mono text-[10px] text-emerald-400">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping mr-2" />
                {shortAddress(wallet.address)}
              </div>
            ) : (
              <button
                type="button"
                onClick={wallet.connect}
                className="inline-flex items-center gap-2 border border-gold/45 text-gold bg-transparent hover:bg-gold hover:text-navy-950 px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors duration-200"
              >
                <Wallet size={12} />
                Connect Wallet
              </button>
            )}

            {/* CTA */}
            <button
              type="button"
              onClick={onOpen}
              className="border border-gold/50 text-gold bg-transparent hover:bg-gold hover:text-navy-950 px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors duration-200"
            >
              File Case
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
