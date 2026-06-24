'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchDisputes, fetchStats, type Dispute, type Stats } from '../lib/contract';

const POLL_MS = 95000;

export interface ContractData {
  disputes: Dispute[];
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  derived: { total: number; pending: number; resolved: number; claimantWins: number; respondentWins: number; dismissed: number };
  refresh: () => Promise<void>;
  setTxInFlight: (v: boolean) => void;
}

export function useContractData(contractAddr: string): ContractData {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const txInFlight = useRef(false);
  const alive = useRef(true);

  const loadAll = useCallback(async () => {
    if (!contractAddr || contractAddr === '0x0000000000000000000000000000000000000000') {
      setLoading(false);
      return;
    }
    try {
      const all: Dispute[] = [];
      let start = 0;
      for (let guard = 0; guard < 50; guard++) {
        const page = await fetchDisputes(contractAddr, start);
        all.push(...page);
        if (page.length < 20) break;
        start += 20;
      }
      const s = await fetchStats(contractAddr);
      if (!alive.current) return;
      setDisputes(all);
      setStats(s);
      setError(null);
    } catch (e) {
      if (!alive.current) return;
      const msg = String(e);
      if (/contract not found|execution reverted/i.test(msg)) {
        setError(
          'No Intelligent Contract responded at this address on Bradbury. Check the deployed contract address.',
        );
      } else {
        setError('Could not reach the contract network.');
      }
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [contractAddr]);

  const refresh = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  const setTxInFlight = useCallback((v: boolean) => {
    txInFlight.current = v;
  }, []);

  useEffect(() => {
    alive.current = true;
    loadAll();
    const id = setInterval(() => {
      if (!txInFlight.current) loadAll();
    }, POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [loadAll]);

  const derived = useMemo(() => {
    const total = disputes.length;
    const resolved = disputes.filter((d) => d.status === 'RESOLVED');
    return {
      total,
      pending: disputes.filter((d) => d.status === 'PENDING').length,
      resolved: resolved.length,
      claimantWins: resolved.filter((d) => d.ruling === 'CLAIMANT_WIN').length,
      respondentWins: resolved.filter((d) => d.ruling === 'RESPONDENT_WIN').length,
      dismissed: resolved.filter((d) => d.ruling === 'DISMISSED').length,
    };
  }, [disputes]);

  return { disputes, stats, loading, error, derived, refresh, setTxInFlight };
}
