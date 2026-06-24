'use client';

import { useEffect, useState } from 'react';
import { X, Gavel, Send, HelpCircle, Loader2 } from 'lucide-react';
import type { useTransaction } from '../hooks/useTransaction';
import type { Dispute } from '../lib/contract';
import { ConsensusStage } from './ConsensusStage';

interface DisputeModalProps {
  open: boolean;
  mode: 'file' | 'resolve';
  target: Dispute | null;
  onClose: () => void;
  address: `0x${string}` | null;
  chainOk: boolean;
  onConnect: () => Promise<void>;
  txApi: ReturnType<typeof useTransaction>;
  setTxInFlight: (v: boolean) => void;
}

export function DisputeModal({
  open,
  mode,
  target,
  onClose,
  address,
  chainOk,
  onConnect,
  txApi,
  setTxInFlight,
}: DisputeModalProps) {
  const [title, setTitle] = useState('');
  const [agreement, setAgreement] = useState('');
  const [claimantCase, setClaimantCase] = useState('');
  const [respondentCase, setRespondentCase] = useState('');
  const [evidence, setEvidence] = useState('');

  const { state: tx, submitFileDispute, submitResolveDispute, reset } = txApi;

  useEffect(() => {
    if (open) {
      reset();
      setTitle('');
      setAgreement('');
      setClaimantCase('');
      setRespondentCase('');
      setEvidence('');
    }
  }, [open, reset]);

  if (!open) return null;

  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !chainOk) return;
    submitFileDispute(address, title, agreement, claimantCase, respondentCase, setTxInFlight);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !chainOk || !target) return;
    submitResolveDispute(address, target.id, evidence, setTxInFlight);
  };

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
            <Gavel size={18} />
            {mode === 'file' ? 'File a New Dispute Case' : 'Submit Settlement Evidence'}
          </h2>
          <button
            onClick={onClose}
            className="text-slatey hover:text-gold transition-colors focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-8 max-h-[75vh] overflow-y-auto scrollbar z-10 relative">
          {/* Wallet checks */}
          {!address ? (
            <div className="text-center py-8">
              <HelpCircle className="mx-auto text-gold/60 mb-4" size={48} />
              <h3 className="font-serif text-lg text-ink">Connect Wallet to Transact</h3>
              <p className="mt-2 text-xs text-slatey max-w-sm mx-auto">
                Arbitration requires signing and paying gas fees on Bradbury. Connect your Web3 browser wallet to proceed.
              </p>
              <button
                type="button"
                onClick={onConnect}
                className="mt-6 border border-gold/50 text-gold bg-transparent hover:bg-gold hover:text-navy-950 px-6 py-3 font-mono text-[11px] uppercase tracking-wider transition-colors duration-200"
              >
                Connect Wallet
              </button>
            </div>
          ) : !chainOk ? (
            <div className="text-center py-8">
              <HelpCircle className="mx-auto text-amber-500 mb-4" size={48} />
              <h3 className="font-serif text-lg text-ink text-amber-500">Bradbury Testnet Required</h3>
              <p className="mt-2 text-xs text-slatey max-w-sm mx-auto">
                Your wallet is connected to an incorrect network. Please switch to GenLayer Bradbury Testnet (Chain ID: 4221).
              </p>
            </div>
          ) : tx.phase === 'wallet' ? (
            <div className="text-center py-12">
              <Loader2 size={36} className="mx-auto text-gold animate-spin mb-4" />
              <h3 className="font-serif text-lg text-ink">Awaiting Wallet Signature</h3>
              <p className="mt-2 text-xs text-slatey">
                Please review and approve the transaction in your wallet browser extension.
              </p>
            </div>
          ) : tx.phase === 'submitted' || tx.phase === 'consensus' ? (
            <ConsensusStage tx={tx} />
          ) : tx.phase === 'confirmed' ? (
            <div className="text-center py-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 rounded-full mb-4">
                ✓
              </div>
              <h3 className="font-serif text-xl text-ink">
                {mode === 'file' ? 'Dispute Filed Successfully' : 'Case Resolved'}
              </h3>
              <p className="mt-2 text-xs text-slatey max-w-sm mx-auto">
                {mode === 'file'
                  ? 'The dispute has been etched on-chain. It is now open to receive settlement evidence.'
                  : `Jury reached consensus ruling: ${tx.result?.ruling}.`}
              </p>
              <div className="mt-6 border border-gold/15 bg-navy-950/30 p-4 rounded text-left font-mono text-[11px] space-y-1">
                <p><span className="text-gold">ID:</span> {tx.result?.id}</p>
                {tx.result?.ruling && (
                  <>
                    <p><span className="text-gold">Ruling:</span> {tx.result?.ruling}</p>
                    <p><span className="text-gold">Confidence:</span> {tx.result?.confidence}%</p>
                    <p><span className="text-gold">Rationale:</span> <span className="italic">"{tx.result?.rationale}"</span></p>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-8 border border-gold/50 text-gold bg-transparent hover:bg-gold hover:text-navy-950 px-8 py-3 font-mono text-xs uppercase tracking-wider transition-colors duration-200"
              >
                Close Panel
              </button>
            </div>
          ) : (
            // Main forms
            <>
              {tx.phase === 'error' && (
                <div className="mb-6 border border-red-500/20 bg-red-950/25 p-4 text-xs text-red-400 rounded">
                  {tx.error}
                </div>
              )}

              {mode === 'file' ? (
                <form onSubmit={handleFileSubmit} className="space-y-6">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-gold mb-2">
                      Dispute Title
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Freelance Web Widget Delivery Conflict"
                      className="w-full border border-gold/15 bg-navy-950 px-4 py-3 text-sm text-ink placeholder-slatey/50 focus:border-gold/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-gold mb-2">
                      Agreement Terms
                    </label>
                    <textarea
                      required
                      maxLength={500}
                      rows={3}
                      value={agreement}
                      onChange={(e) => setAgreement(e.target.value)}
                      placeholder="Detail the exact terms or code specifications agreed upon..."
                      className="w-full border border-gold/15 bg-navy-950 px-4 py-3 text-sm text-ink placeholder-slatey/50 focus:border-gold/50 focus:outline-none resize-none"
                    />
                    <span className="block text-right font-mono text-[9px] text-faint mt-1">
                      {agreement.length}/500
                    </span>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-gold mb-2">
                        Claimant's Case Arguments
                      </label>
                      <textarea
                        required
                        maxLength={400}
                        rows={4}
                        value={claimantCase}
                        onChange={(e) => setClaimantCase(e.target.value)}
                        placeholder="Why do you argue the agreement was breached?"
                        className="w-full border border-gold/15 bg-navy-950 px-4 py-3 text-sm text-ink placeholder-slatey/50 focus:border-gold/50 focus:outline-none resize-none"
                      />
                      <span className="block text-right font-mono text-[9px] text-faint mt-1">
                        {claimantCase.length}/400
                      </span>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-gold mb-2">
                        Respondent's Case Arguments
                      </label>
                      <textarea
                        required
                        maxLength={400}
                        rows={4}
                        value={respondentCase}
                        onChange={(e) => setRespondentCase(e.target.value)}
                        placeholder="What is the developer/respondent's defense?"
                        className="w-full border border-gold/15 bg-navy-950 px-4 py-3 text-sm text-ink placeholder-slatey/50 focus:border-gold/50 focus:outline-none resize-none"
                      />
                      <span className="block text-right font-mono text-[9px] text-faint mt-1">
                        {respondentCase.length}/400
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gold/10 pt-6 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 border border-gold/50 text-gold bg-transparent hover:bg-gold hover:text-navy-950 px-8 py-3.5 font-mono text-xs uppercase tracking-wider transition-colors duration-200"
                    >
                      <Send size={13} />
                      File Dispute Case
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResolveSubmit} className="space-y-6">
                  <div className="border border-gold/10 bg-navy-950/40 p-4 rounded text-xs space-y-2 text-slatey">
                    <p><span className="font-mono text-gold">DISPUTE:</span> {target?.title}</p>
                    <p><span className="font-mono text-gold">TERMS:</span> {target?.agreement}</p>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-gold mb-2">
                      Submitted Evidence & Telemetry Logs
                    </label>
                    <textarea
                      required
                      maxLength={600}
                      rows={6}
                      value={evidence}
                      onChange={(e) => setEvidence(e.target.value)}
                      placeholder="Paste code blocks, console telemetry logs, or commit references as settlement evidence..."
                      className="w-full border border-gold/15 bg-navy-950 px-4 py-3 text-sm text-ink placeholder-slatey/50 focus:border-gold/50 focus:outline-none resize-none"
                    />
                    <span className="block text-right font-mono text-[9px] text-faint mt-1">
                      {evidence.length}/600
                    </span>
                  </div>

                  <div className="border-t border-gold/10 pt-6 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 border border-gold/50 text-gold bg-transparent hover:bg-gold hover:text-navy-950 px-8 py-3.5 font-mono text-xs uppercase tracking-wider transition-colors duration-200"
                    >
                      <Gavel size={14} />
                      Submit for Deliberation
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
