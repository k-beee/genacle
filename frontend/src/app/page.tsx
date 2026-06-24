'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, Search, Gavel } from 'lucide-react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { DisputeCard } from '../components/DisputeCard';
import { Skeleton, EmptyState, ErrorState } from '../components/States';
import { DisputeModal } from '../components/DisputeModal';
import { CaseDetailModal } from '../components/CaseDetailModal';
import { Footer } from '../components/Footer';
import { useWallet } from '../hooks/useWallet';
import { useContractData } from '../hooks/useContractData';
import { useTransaction } from '../hooks/useTransaction';
import type { Dispute } from '../lib/contract';

type Filter = 'ALL' | 'PENDING' | 'CLAIMANT_WIN' | 'RESPONDENT_WIN' | 'DISMISSED';

export default function Home() {
  const wallet = useWallet();
  
  // Back contractAddr with local storage so it persists between reloads
  const [contractAddr, setContractAddr] = useState<string>('');

  useEffect(() => {
    // Try to load from deployment.json first if exists, otherwise fallback to localstorage
    const stored = localStorage.getItem('genacle_contract_addr');
    if (stored) {
      setContractAddr(stored);
    } else {
      // Fallback placeholder address
      setContractAddr('0x0000000000000000000000000000000000000000');
    }
  }, []);

  const handleContractAddrChange = (newAddr: string) => {
    setContractAddr(newAddr);
    localStorage.setItem('genacle_contract_addr', newAddr);
  };

  const data = useContractData(contractAddr);
  const txApi = useTransaction(contractAddr, () => {
    void data.refresh();
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'file' | 'resolve'>('file');
  const [targetDispute, setTargetDispute] = useState<Dispute | null>(null);
  
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');

  const openFileModal = () => {
    setModalMode('file');
    setTargetDispute(null);
    setModalOpen(true);
  };

  const openResolveModal = (d: Dispute) => {
    setModalMode('resolve');
    setTargetDispute(d);
    setModalOpen(true);
  };

  const openDetailModal = (d: Dispute) => {
    setSelectedDispute(d);
    setDetailOpen(true);
  };

  const filtered = useMemo(() => {
    let list = [...data.disputes].sort((a, b) => b.index - a.index);
    
    // Status Filter
    if (filter === 'PENDING') {
      list = list.filter((d) => d.status === 'PENDING');
    } else if (filter !== 'ALL') {
      list = list.filter((d) => d.status === 'RESOLVED' && d.ruling === filter);
    }

    // Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.agreement.toLowerCase().includes(q)
      );
    }
    
    return list;
  }, [data.disputes, filter, search]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'ALL', label: `All (${data.derived.total})` },
    { key: 'PENDING', label: `Pending (${data.derived.pending})` },
    { key: 'CLAIMANT_WIN', label: `Claimant Wins (${data.derived.claimantWins})` },
    { key: 'RESPONDENT_WIN', label: `Respondent Wins (${data.derived.respondentWins})` },
    { key: 'DISMISSED', label: `Dismissed (${data.derived.dismissed})` },
  ];

  return (
    <div className="min-h-screen bg-navy-950 font-sans text-slatey selection:bg-gold selection:text-navy-950 flex flex-col justify-between">
      <div>
        <Header
          wallet={wallet}
          onOpen={openFileModal}
          contractAddr={contractAddr}
          onContractAddrChange={handleContractAddrChange}
        />
        
        <Hero onOpen={openFileModal} stats={data.derived} />

        {/* Docket Board Section */}
        <section id="board" className="border-t border-gold/15 py-24 bg-navy-900/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-gold flex items-center gap-1.5">
                  <Scale size={11} /> Docket Board
                </span>
                <h2 className="mt-3 font-serif text-3xl font-400 text-ink uppercase tracking-tight sm:text-4xl">
                  Disputes Registry
                </h2>
              </div>
              
              {/* Search Docket */}
              <div className="relative w-full max-w-xs">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slatey/60" />
                <input
                  type="text"
                  placeholder="Search docket..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gold/15 bg-navy-900 px-10 py-2.5 text-xs text-ink placeholder-slatey/50 focus:border-gold/50 focus:outline-none rounded-md"
                />
              </div>
            </div>

            {/* Filters Bar */}
            <div className="mt-10 flex flex-wrap gap-2 border-b border-gold/10 pb-5">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`border px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors rounded ${
                    filter === f.key
                      ? 'border-gold bg-gold text-navy-950 font-bold'
                      : 'border-gold/20 text-slatey hover:border-gold/50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="mt-12">
              {contractAddr === '0x0000000000000000000000000000000000000000' ? (
                <div className="relative border border-dashed border-gold/20 bg-navy-900/30 px-6 py-14 text-center rounded-lg max-w-xl mx-auto">
                  <div className="absolute inset-1.5 border border-double border-gold/5 rounded pointer-events-none" />
                  <h3 className="font-serif text-lg text-gold">Deployment Required</h3>
                  <p className="mt-2 text-xs text-slatey">
                    Please deploy the Intelligent Contract and enter the address in the header bar configuration input to read dock files.
                  </p>
                </div>
              ) : data.loading ? (
                <Skeleton />
              ) : data.error ? (
                <ErrorState message={data.error} onRetry={() => data.refresh()} />
              ) : data.disputes.length === 0 ? (
                <EmptyState onOpen={openFileModal} />
              ) : filtered.length === 0 ? (
                <div className="relative border border-dashed border-gold/15 bg-navy-900/40 p-12 text-center rounded">
                  <div className="absolute inset-1 border border-double border-gold/5 rounded pointer-events-none" />
                  <p className="text-xs text-slatey">No docket cases matched your filter constraints.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((d) => (
                    <DisputeCard
                      key={d.id}
                      dispute={d}
                      onSelect={openDetailModal}
                      onResolve={openResolveModal}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Classy Escrow Promotion bar */}
            <div className="relative mt-20 border border-gold bg-gold/5 p-8 flex flex-col justify-between items-center sm:flex-row rounded-lg">
              <div className="absolute inset-1.5 border border-double border-gold/10 rounded pointer-events-none" />
              <div className="text-left mb-6 sm:mb-0 max-w-lg z-10">
                <h3 className="font-serif text-xl text-ink uppercase tracking-wider flex items-center gap-2">
                  <Gavel size={18} className="text-gold" /> Need a binding legal oracle?
                </h3>
                <p className="mt-2 text-xs text-slatey">
                  Etch agreement terms on-chain. When a conflict occurs, submit developer console outputs, telemetry logs, or commit histories for a decentralized decision under consensus.
                </p>
              </div>
              <button
                type="button"
                onClick={openFileModal}
                className="z-10 shrink-0 border border-gold bg-gold px-8 py-3.5 font-mono text-xs uppercase tracking-widest text-navy-950 font-bold hover:bg-gold/90 transition-transform hover:-translate-y-0.5"
              >
                File Case Dossier
              </button>
            </div>
          </div>
        </section>
      </div>

      <Footer />

      <DisputeModal
        open={modalOpen}
        mode={modalMode}
        target={targetDispute}
        onClose={() => setModalOpen(false)}
        address={wallet.address}
        chainOk={wallet.chainOk}
        onConnect={wallet.connect}
        txApi={txApi}
        setTxInFlight={data.setTxInFlight}
      />

      <CaseDetailModal
        dispute={selectedDispute}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
