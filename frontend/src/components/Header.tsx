'use client';

import { Gavel, Globe, Wallet, ExternalLink, Settings } from 'lucide-react';
import type { WalletState } from '../hooks/useWallet';
import { shortAddress } from '../lib/format';
import { useState, useEffect } from 'react';

interface HeaderProps {
  wallet: WalletState;
  onOpen: () => void;
  contractAddr: string;
  onContractAddrChange: (v: string) => void;
}

export function Header({ wallet, onOpen, contractAddr, onContractAddrChange }: HeaderProps) {
  const [addrInput, setAddrInput] = useState(contractAddr);

  useEffect(() => {
    setAddrInput(contractAddr);
  }, [contractAddr]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onContractAddrChange(addrInput.trim());
  };

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

          {/* Controls & Address Settings */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Contract Address Editor */}
            <form onSubmit={handleSave} className="flex items-center border border-gold/20 bg-navy-900 rounded overflow-hidden">
              <span className="pl-3 font-mono text-[9px] uppercase tracking-wider text-slatey/85 flex items-center gap-1.5">
                <Settings size={10} className="text-gold/70" /> Contract:
              </span>
              <input
                type="text"
                placeholder="Paste Deployed Contract Address..."
                value={addrInput}
                onChange={(e) => setAddrInput(e.target.value)}
                className="bg-transparent border-0 px-3 py-2 text-[10px] font-mono text-ink placeholder-slatey/40 focus:outline-none focus:ring-0 w-[180px] sm:w-[240px]"
              />
              <button
                type="submit"
                className="bg-gold/10 hover:bg-gold hover:text-navy-950 border-l border-gold/15 px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-gold transition-colors"
              >
                Set
              </button>
            </form>

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
                className="inline-flex items-center gap-2 border border-gold/40 hover:border-gold px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-gold hover:bg-gold/5 transition-colors"
              >
                <Wallet size={12} />
                Connect Wallet
              </button>
            )}

            {/* CTA */}
            <button
              type="button"
              onClick={onOpen}
              className="border border-gold bg-gold hover:bg-gold/90 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-navy-950 font-bold transition-colors"
            >
              File Case
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
