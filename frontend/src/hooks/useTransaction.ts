'use client';

import { useCallback, useRef, useState } from 'react';
import {
  makeWalletClient,
  fileDispute,
  resolveDispute,
  fetchDisputes,
  fetchStats,
  type Dispute,
} from '../lib/contract';
import { pollUntilDecided, type LeaderDraft } from '../lib/tx';

export type TxPhase = 'idle' | 'wallet' | 'submitted' | 'consensus' | 'confirmed' | 'error';
export type TxKind = 'file' | 'resolve';

export interface TxState {
  phase: TxPhase;
  kind: TxKind | null;
  hash: `0x${string}` | null;
  liveStatus: string;
  draft: LeaderDraft | null;
  result: Dispute | null;
  error: string | null;
}

const INITIAL: TxState = {
  phase: 'idle',
  kind: null,
  hash: null,
  liveStatus: '',
  draft: null,
  result: null,
  error: null,
};

function friendlyError(e: unknown): string {
  const m = String(e);
  if (/LackOfFundForMaxFee/i.test(m))
    return 'Your wallet balance is below the fee reserve required for AI writes on Bradbury. Top up at testnet-faucet.genlayer.foundation';
  if (/reject|denied|4001/i.test(m)) return 'Signature request was rejected in wallet';
  if (/rate limit|429|-32/i.test(m)) return 'The network is congested. Your transaction may still be in progress';
  if (/fetch|network|timeout/i.test(m)) return 'Network error. Please verify RPC endpoint connection';
  return 'The transaction failed. Please try again';
}

export function useTransaction(contractAddr: string, onConfirmed?: () => void) {
  const [state, setState] = useState<TxState>(INITIAL);
  const busy = useRef(false);

  const reset = useCallback(() => {
    busy.current = false;
    setState(INITIAL);
  }, []);

  const run = useCallback(
    async (
      kind: TxKind,
      address: `0x${string}`,
      send: (client: ReturnType<typeof makeWalletClient>) => Promise<`0x${string}`>,
      targetId: string | null,
      onFlight?: (v: boolean) => void,
    ) => {
      if (busy.current) return;
      busy.current = true;
      onFlight?.(true);
      setState({ ...INITIAL, phase: 'wallet', kind });
      try {
        const client = makeWalletClient(address);
        const hash = await send(client);
        setState((s) => ({ ...s, phase: 'submitted', hash }));
        setState((s) => ({ ...s, phase: 'consensus', liveStatus: 'PENDING' }));

        const { status, draft } = await pollUntilDecided(client, hash, (st, dr) => {
          setState((s) => ({ ...s, liveStatus: st, draft: dr }));
        });

        if (status === 'UNDETERMINED' || status === 'CANCELED' || status === 'TIMEOUT') {
          setState((s) => ({
            ...s,
            phase: 'error',
            error:
              status === 'TIMEOUT'
                ? 'Network execution timed out. The transaction is still being processed'
                : 'AI Jurors could not reach a consensus ruling on this dispute',
          }));
          busy.current = false;
          onFlight?.(false);
          return;
        }

        // Fetch actual state back from the contract.
        let result: Dispute | null = null;
        for (let i = 0; i < 5; i++) {
          try {
            const stats = await fetchStats(contractAddr);
            const page = await fetchDisputes(contractAddr, Math.max(0, Math.floor(Math.max(0, stats.disputes - 1) / 20) * 20));
            if (targetId) {
              result = page.find((f) => f.id === targetId) ?? null;
            } else {
              result = page.length ? page[page.length - 1] : null;
            }
            if (result) break;
          } catch {
            /* retry */
          }
          await new Promise((r) => setTimeout(r, 6000));
        }

        setState((s) => ({ ...s, phase: 'confirmed', result }));
        busy.current = false;
        onFlight?.(false);
        onConfirmed?.();
      } catch (e) {
        setState((s) => ({ ...s, phase: 'error', error: friendlyError(e) }));
        busy.current = false;
        onFlight?.(false);
      }
    },
    [contractAddr, onConfirmed],
  );

  const submitFileDispute = useCallback(
    (address: `0x${string}`, title: string, agreement: string, claimantCase: string, respondentCase: string, onFlight?: (v: boolean) => void) =>
      run('file', address, (c) => fileDispute(c, contractAddr, title, agreement, claimantCase, respondentCase), null, onFlight),
    [contractAddr, run],
  );

  const submitResolveDispute = useCallback(
    (address: `0x${string}`, disputeId: string, evidence: string, onFlight?: (v: boolean) => void) =>
      run('resolve', address, (c) => resolveDispute(c, contractAddr, disputeId, evidence), disputeId, onFlight),
    [contractAddr, run],
  );

  return { state, submitFileDispute, submitResolveDispute, reset };
}
